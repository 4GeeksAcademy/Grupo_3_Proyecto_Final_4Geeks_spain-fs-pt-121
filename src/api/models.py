from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import String, Boolean, Date, ForeignKey, UniqueConstraint, Float
from sqlalchemy.orm import Mapped, mapped_column, relationship
from typing import List

db = SQLAlchemy()


class User(db.Model):
    __tablename__ = "user"

    id: Mapped[int] = mapped_column(primary_key=True)
    nombre_usuario: Mapped[str] = mapped_column(String(50), unique=True, nullable=False)
    nombre: Mapped[str] = mapped_column(nullable=False)
    apellido: Mapped[str] = mapped_column(nullable=False)
    email: Mapped[str] = mapped_column(unique=True, nullable=False)
    password: Mapped[str] = mapped_column(nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean(), nullable=False, default=True)

    favoritos_gasto: Mapped[List["FavoritoGasto"]] = relationship(
        back_populates="user", cascade="all, delete-orphan"
    )

    def serialize(self):
        return {
            "id": self.id,
            "email": self.email,
            "nombre_usuario": self.nombre_usuario,
            "nombre": self.nombre,
            "apellido": self.apellido,
            "is_active": self.is_active
        }


class Gasto(db.Model):
    __tablename__ = "gasto"

    id: Mapped[int] = mapped_column(primary_key=True)
    gasto: Mapped[str] = mapped_column(nullable=False)
    tipo: Mapped[str] = mapped_column(nullable=False)
    descripcion: Mapped[str] = mapped_column(String(500))
    monto: Mapped[float] = mapped_column(Float, nullable=False)
    fecha: Mapped[Date] = mapped_column(Date, nullable=False)

    favorito_by: Mapped[List["FavoritoGasto"]] = relationship(
        back_populates="gasto", cascade="all, delete-orphan"
    )

    def serialize(self):
        return {
            "id": self.id,
            "gasto": self.gasto,
            "tipo": self.tipo,
            "descripcion": self.descripcion,
            "monto": self.monto,
            "fecha": self.fecha.isoformat()
        }


class FavoritoGasto(db.Model):
    __tablename__ = "favorito_gasto"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("user.id"), nullable=False)
    gasto_id: Mapped[int] = mapped_column(ForeignKey("gasto.id"), nullable=False)

    __table_args__ = (UniqueConstraint("user_id", "gasto_id", name="uq_user_gasto"),)

    user: Mapped["User"] = relationship(back_populates="favoritos_gasto")
    gasto: Mapped["Gasto"] = relationship(back_populates="favorito_by")

    def serialize(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "gasto_id": self.gasto_id
        }