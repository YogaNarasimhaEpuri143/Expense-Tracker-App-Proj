import re


class MessageUtil:
    
    def __init__(self):
        pass

    def isbanksms(self, message):
        words_to_search = ["bank", "spent", "spend", "card"]
        pattern = r'\b(?:' + '|'.join(re.escape(word) for word in words_to_search) + r')\b'
        return re.search(pattern, message, flags=re.IGNORECASE)
