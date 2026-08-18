import re
import html

content_path = r"C:\Users\Praneet\.gemini\antigravity\brain\e7389e60-49a4-444d-9d06-24653c995225\.system_generated\steps\2948\content.md"

with open(content_path, "r", encoding="utf-8", errors="ignore") as f:
    text = f.read()

# Find text blocks inside script or body
# Remove html tags
clean_text = re.sub(r'<script.*?>.*?</script>', '', text, flags=re.DOTALL)
clean_text = re.sub(r'<style.*?>.*?</style>', '', clean_text, flags=re.DOTALL)
clean_text = re.sub(r'<.*?>', ' ', clean_text)
clean_text = html.unescape(clean_text)

# Clean extra spaces
clean_text = re.sub(r'\s+', ' ', clean_text)

print("Extracted Length:", len(clean_text))
print("First 3000 chars:\n")
print(clean_text[:3000])

# Search for keywords like Protocol, Login, Heartbeat, Packet, 0x, Arcmos, Header
matches = re.findall(r'(?:Arcmos|Protocol|Packet|Login|Heartbeat|Location|7878|0x[0-9A-Fa-f]+|IMEI)[^\n\r]{0,200}', clean_text)
print("\n=== KEYWORD MATCHES ===")
for m in matches[:40]:
    print(" ->", m)
