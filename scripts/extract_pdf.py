import PyPDF2
import sys

def extract(pdf_path):
    with open(pdf_path, 'rb') as f:
        reader = PyPDF2.PdfReader(f)
        text = ""
        for p in reader.pages:
            text += p.extract_text() + "\n"
    with open("extracted_pdf.txt", "w", encoding="utf-8") as f:
        f.write(text)
    print("Done")

if __name__ == "__main__":
    extract("Employee_Onboarding_Portal_Project_Document.pdf")
