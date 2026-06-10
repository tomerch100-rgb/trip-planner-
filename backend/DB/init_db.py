from sqlalchemy import text
from db import engine 

sql_script = """
-- תדביק ממש כאן את כל ה-SQL של השותף שלך
-- החל מהשורה של DROP TABLE ועד ל-INSERT האחרון
"""

with engine.connect() as conn:
    conn.execute(text(sql_script))
    conn.commit()
    
print("Tables and data injected successfully!")