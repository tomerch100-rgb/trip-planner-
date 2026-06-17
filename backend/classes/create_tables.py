from backend.DB.db import engine, Base
import backend.classes.models # טוען את המודל כדי ש-SQLAlchemy יזהה את השינוי

print("⏳ מעדכן את הטבלאות ומייצר את עמודת הקטגוריות ב-Neon...")
Base.metadata.create_all(bind=engine)
print("✅ הטבלאות עודכנו בהצלחה ב-Neon Database!")
  