import os
from flask import Flask, request, jsonify
from flask_cors import CORS
import oracledb
from openai import OpenAI
from dotenv import load_dotenv
import numpy as np

# Load env variables from parent directory
load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env'))

app = Flask(__name__)
CORS(app)

XAI_API_KEY = os.getenv("XAI_API_KEY")
ORACLE_USER = os.getenv("ORACLE_USER", "onboarding_user")
ORACLE_PASSWORD = os.getenv("ORACLE_PASSWORD", "onboarding123")
ORACLE_DSN = os.getenv("ORACLE_DSN", "localhost:1521/XEPDB1")

xai_client = None
if XAI_API_KEY:
    try:
        xai_client = OpenAI(api_key=XAI_API_KEY, base_url="https://api.x.ai/v1")
    except Exception as e:
        print(f"Failed to initialize xAI client: {e}")
        xai_client = None
else:
    print("XAI_API_KEY is not set. AI service will run in fallback mode.")

def get_db_connection():
    return oracledb.connect(user=ORACLE_USER, password=ORACLE_PASSWORD, dsn=ORACLE_DSN)

import threading

# Initialize the embedder in the background
embedder = None
faq_corpus = []
faiss_index = None

def init_ai_models():
    global embedder
    print("Loading sentence transformer model in background...")
    try:
        from sentence_transformers import SentenceTransformer
        embedder = SentenceTransformer('all-MiniLM-L6-v2')
        load_faqs_into_faiss()
    except Exception as e:
        print(f"Warning: Failed to load embedder. {e}")
        embedder = None

def load_faqs_into_faiss():
    global faiss_index, faq_corpus
    if not embedder:
        return
    try:
        import numpy as np
        import faiss
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute("SELECT question, answer, keywords FROM ONBOARDING_FAQS")
        rows = cur.fetchall()
        faq_corpus = []
        texts_to_embed = []
        for q, a, kw in rows:
            a_text = a.read() if hasattr(a, 'read') else a
            faq_corpus.append({"question": q, "answer": a_text})
            text = f"{q} {kw if kw else ''}"
            texts_to_embed.append(text)
            
        conn.close()
        if texts_to_embed:
            embeddings = embedder.encode(texts_to_embed)
            dimension = len(embeddings[0])
            faiss_index = faiss.IndexFlatL2(dimension)
            faiss_index.add(np.array(embeddings, dtype=np.float32))
            print(f"Loaded {len(faq_corpus)} FAQs into FAISS index.")
    except Exception as e:
        print(f"Failed to load FAQs into FAISS: {e}")

threading.Thread(target=init_ai_models, daemon=True).start()


def search_faqs(question, top_k=3):
    """
    True Semantic RAG search using Faiss and Vector Embeddings
    """
    relevant_faqs = []
    if not faiss_index or not embedder or len(faq_corpus) == 0:
        return relevant_faqs
        
    try:
        q_emb = embedder.encode([question])
        D, I = faiss_index.search(np.array(q_emb, dtype=np.float32), min(top_k, len(faq_corpus)))
        for idx in I[0]:
            if 0 <= idx < len(faq_corpus):
                relevant_faqs.append(faq_corpus[idx])
    except Exception as e:
        print(f"Failed semantic search: {e}")
        
    return relevant_faqs

from typing import Any, Dict

def get_user_realtime_context(user_id) -> Dict[str, Any]:
    context = {
        "tasks": [],
        "trainings": [],
        "buddy": {},
        "assets": [],
        "documents": []
    }
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # 1. Pending Tasks
        cursor.execute("SELECT t.title, ta.due_date FROM TASK_ASSIGNMENTS ta JOIN ONBOARDING_TASKS t ON ta.task_id = t.task_id WHERE ta.user_id = :1 AND ta.status = 'Pending'", [user_id])
        context["tasks"] = [{"title": row[0], "due_date": str(row[1])[:10] if row[1] else "N/A"} for row in cursor.fetchall()]
        
        # 2. Trainings
        cursor.execute("SELECT t.title, ta.status FROM TRAINING_ASSIGNMENTS ta JOIN TRAININGS t ON ta.training_id = t.training_id WHERE ta.user_id = :1", [user_id])
        context["trainings"] = [{"title": row[0], "status": row[1]} for row in cursor.fetchall()]
        
        # 3. Assets
        cursor.execute("SELECT a.name, a.category, CASE WHEN aa.confirmed_at IS NULL THEN 'Pending' ELSE 'Confirmed' END as status FROM ASSET_ASSIGNMENTS aa JOIN ASSETS a ON aa.asset_id = a.asset_id WHERE aa.user_id = :1", [user_id])
        context["assets"] = [{"name": row[0], "category": row[1], "status": row[2]} for row in cursor.fetchall()]
        
        # 4. Buddy
        cursor.execute("SELECT u.name, u.email FROM BUDDIES b JOIN USERS u ON b.buddy_user_id = u.user_id WHERE b.new_hire_id = :1", [user_id])
        buddy = cursor.fetchone()
        if buddy:
            context["buddy"] = {"name": buddy[0], "email": buddy[1]}
            
        # 5. Documents
        cursor.execute("SELECT doc_type, status FROM DOCUMENTS WHERE user_id = :1", [user_id])
        context["documents"] = [{"type": row[0], "status": row[1]} for row in cursor.fetchall()]
        
        conn.close()
    except Exception as e:
        print(f"Failed to fetch real-time context: {e}")
    return context

def generate_fallback_reply(query, relevant_faqs, pending_tasks):
    messages = []
    if relevant_faqs:
        messages.append("I found these relevant policy answers:")
        for faq in relevant_faqs:
            messages.append(f"Q: {faq['question']}\nA: {faq['answer']}")
    if pending_tasks:
        messages.append("Here are your pending tasks:")
        for t in pending_tasks:
            messages.append(f"- {t['title']} (Due: {t['due_date']})")

    if not messages:
        return (
            "I couldn't find a direct answer in the company records. "
            "Please ask a more specific question or contact your HR administrator."
        )

    return "\n\n".join(messages)

@app.route("/chatbot/health", methods=["GET"])
def health_check():
    return jsonify({"status": "ok"})

@app.route("/chatbot/ask", methods=["POST"])
def ask_chatbot():
    data = request.json
    user_query = data.get("query")
    user_id = data.get("user_id")
    
    if not user_query or not user_id:
        return jsonify({"error": "Missing query or user_id"}), 400
        
    try:
        # Fetch real-time data from Oracle
        relevant_faqs = search_faqs(user_query)
        user_ctx = get_user_realtime_context(user_id)
        
        faq_context = "\n\n".join([f"Q: {f['question']}\nA: {f['answer']}" for f in relevant_faqs])
        
        rt_context = []
        if user_ctx["tasks"]:
            rt_context.append("Pending tasks: " + ", ".join([f"{t['title']} (Due {t['due_date']})" for t in user_ctx["tasks"]]))
        if user_ctx["trainings"]:
            rt_context.append("Trainings: " + ", ".join([f"{t['title']} ({t['status']})" for t in user_ctx["trainings"]]))
        if user_ctx["buddy"]:
            rt_context.append(f"Assigned Buddy: {user_ctx['buddy']['name']} ({user_ctx['buddy']['email']})")
        if user_ctx["assets"]:
            rt_context.append("IT Assets: " + ", ".join([f"{a['name']} ({a['status']})" for a in user_ctx["assets"]]))
        if user_ctx["documents"]:
            rt_context.append("Documents: " + ", ".join([f"{d['type']} ({d['status']})" for d in user_ctx["documents"]]))
            
        real_time_info = "\n".join(rt_context) if rt_context else "No real-time user data available."
        
        context = f"""
        Company policy: {faq_context if faq_context else 'No specific policies found.'}
        Real-time Employee Data (Current User): 
        {real_time_info}
        """
        
        system_prompt = f"""
        You are a friendly enterprise onboarding assistant for Wipro.
        Your primary goal is to help new hires by providing accurate, personalized guidance.
        
        <context>
        {context}
        </context>
        
        CRITICAL RULES:
        1. Base your answer ONLY on the provided Company Policy and Pending Tasks context.
        2. If the user asks a question not covered by the context, politely state that you do not have that information and advise them to contact HR. DO NOT hallucinate answers.
        3. Keep your tone encouraging and helpful.
        
        Question: {user_query}
        Answer:
        """

        if xai_client is None:
            fallback_reply = generate_fallback_reply(user_query, relevant_faqs, user_ctx.get("tasks", []))
            return jsonify({"reply": fallback_reply, "mode": "fallback (sql)"})

        try:
            completion = xai_client.chat.completions.create(
                model="grok-beta",
                messages=[
                    {"role": "system", "content": system_prompt}
                ],
                temperature=0.3,
                max_tokens=500
            )
            reply = completion.choices[0].message.content
            return jsonify({"reply": reply, "mode": "grok-rag-sql"})
        except Exception as e:
            print(f"xAI completion error: {e}")
            fallback_reply = generate_fallback_reply(user_query, relevant_faqs, user_ctx.get("tasks", []))
            return jsonify({"reply": fallback_reply, "mode": "fallback (sql)", "warning": "xAI failed."})
        
    except Exception as e:
        print(e)
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
