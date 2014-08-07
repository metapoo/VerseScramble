from mongo.models import BaseModel

class User(BaseModel):
    class Meta:
        collection = "users"
        
        indices = (
        )
