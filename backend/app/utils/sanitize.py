import re

def sanitize_query(query: str) -> str:
	if not isinstance(query, str):
		return ""
	clean = query.strip()
	clean = re.sub(r"[\n\r\t]", " ", clean)
	clean = re.sub(r"\s+", " ", clean)
	return clean[:200]


