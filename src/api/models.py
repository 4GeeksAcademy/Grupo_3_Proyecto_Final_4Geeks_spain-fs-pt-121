from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import String, Boolean
from sqlalchemy.orm import Mapped, mapped_column

db = SQLAlchemy()

class User(db.Model):
    id: Mapped[int] = mapped_column(primary_key=True)
    email: Mapped[str] = mapped_column(String(120), unique=True, nullable=False)
    password: Mapped[str] = mapped_column(nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean(), nullable=False)


    def serialize(self):
        return {
            "id": self.id,
            "email": self.email,
            # do not serialize the password, its a security breach
        }
    
class Personaje(db.Model):
    __tablename__ = "personaje"

    id: Mapped[int] = mapped_column(primary_key=True)
    nombre: Mapped[str] = mapped_column(nullable=False)
    apellido: Mapped[str] = mapped_column(nullable=False)
    planeta: Mapped[str] = mapped_column(String(500), nullable=True)
    bueno: Mapped[bool] = mapped_column(Boolean(), nullable=False, default=True)

    pelicula_id: Mapped[int] = mapped_column(ForeignKey("pelicula.id"), nullable=True)
    pelicula: Mapped["Pelicula"] = relationship(back_populates="personajes")
    favorito_by: Mapped[List["FavoritoPersonaje"]] = relationship( back_populates="personaje", cascade="all, delete-orphan")

    def serialize(self):
        return {
            "id": self.id,
            "nombre": self.nombre,
            "apellido": self.apellido,
            "planeta": self.planeta,
            "bueno": self.bueno,
            "pelicula_id": self.pelicula_id
        }