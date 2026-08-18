import requests

doc_id = "1Afj_JgY0Vn0cVAnfrV9jjikAnWBC89O4AZRG6NAyw0M"
export_url = f"https://docs.google.com/document/d/{doc_id}/export?format=txt"

r = requests.get(export_url)
if r.status_code == 200:
    with open("gdoc_protocol.txt", "w", encoding="utf-8") as f:
        f.write(r.text)
    print("SAVED gdoc_protocol.txt successfully!")
else:
    print(f"Error {r.status_code}")
