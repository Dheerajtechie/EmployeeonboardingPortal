import os
from flask import Flask, request, jsonify
from flask_cors import CORS
import oracledb
from groq import Groq
from dotenv import load_dotenv

# Load env variables from parent directory
load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env'))

app = Flask(__name__)
CORS(app)

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
ORACLE_USER = os.getenv("ORACLE_USER", "onboarding_user")
ORACLE_PASSWORD = os.getenv("ORACLE_PASSWORD", "onboarding123")
ORACLE_DSN = os.getenv("ORACLE_DSN", "localhost:1521/XEPDB1")

groq_client = Groq(api_key=GROQ_API_KEY)

def get_db_connection():
    return oracledb.connect(user=ORACLE_USER, password=ORACLE_PASSWORD, dsn=ORACLE_DSN)

def retrieve_context(query, user_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # 1. Fetch relevant FAQs based on simple keyword match
    cursor.execute("SELECT question, answer FROM ONBOARDING_FAQS")
    all_faqs = cursor.fetchall()
    
    relevant_faqs = []
    query_lower = query.lower()
    for q, a in all_faqs:
        a_text = a.read() if hasattr(a, 'read') else a
        if any(word in q.lower() or word in a_text.lower() for word in query_lower.split()):
            relevant_faqs.append(f"Q: {q}\\nA: {a_text}")
            
    # 2. Fetch pending tasks for this user
    cursor.execute('''
        SELECT t.title, ta.due_date 
        FROM TASK_ASSIGNMENTS ta
        JOIN ONBOARDING_TASKS t ON ta.task_id = t.task_id
        WHERE ta.user_id = :1 AND ta.status = 'Pending'
    ''', [user_id])
    pending_tasks = cursor.fetchall()
    
    task_context = "\\n".join([f"- {title} (Due: {due.strftime('%Y-%m-%d')})" for title, due in pending_tasks])
    faq_context = "\\n\\n".join(relevant_faqs[:3]) # Take top 3
    
    conn.close()
    
    return f"""
    Context Info from HR Database:
    
    User's Pending Tasks:
    {task_context if task_context else 'No pending tasks.'}
    
    Relevant Company FAQs:
    {faq_context if faq_context else 'No specific policies found.'}
    """

@app.route("/chatbot/ask", methods=["POST"])
def ask_chatbot():
    data = request.json
    user_query = data.get("query")
    user_id = data.get("user_id")
    
    if not user_query or not user_id:
        return jsonify({"error": "Missing query or user_id"}), 400
        
    try:
        context = retrieve_context(user_query, user_id)
        
        system_prompt = f"""
        You are an AI HR assistant for new employees. You are helpful, friendly, and concise.
        Use the following retrieved context to answer the user's question accurately.
        If the answer is not in the context, do your best to answer generally, but clarify you don't have company-specific details.
        
        {context}
        """
        
        completion = groq_client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_query}
            ],
            temperature=0.3,
            max_tokens=500
        )
        
        reply = completion.choices[0].message.content
        return jsonify({"reply": reply})
        
    except Exception as e:
        print(e)
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
