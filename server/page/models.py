from verserain.mongo.models import BaseModel
from minimongo import Index

class Page(BaseModel):
    class Meta:
        collection = "pages"
        
        indices = (
            Index("name",unique=True),
        )

    
