from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import String, Boolean, Date, ForeignKey, UniqueConstraint, Float
from sqlalchemy.orm import Mapped, mapped_column, relationship
from typing import List
from datetime import datetime

db = SQLAlchemy()


class User(db.Model):
    __tablename__ = "user"

    id: Mapped[int] = mapped_column(primary_key=True)
    email: Mapped[str] = mapped_column(
        String(120), unique=True, nullable=False)
    username: Mapped[str] = mapped_column(
        String(50), unique=True, nullable=False)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    is_active: Mapped[bool] = mapped_column(
        Boolean(), nullable=False, default=True)

    def serialize(self):
        return {
            "id": self.id,
            "email": self.email,
            "username": self.username,
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

    def serialize(self):
        return {
            "id": self.id,
            "gasto": self.gasto,
            "tipo": self.tipo,
            "descripcion": self.descripcion,
            "monto": self.monto,
            "fecha": self.fecha.isoformat()
        }


class SavingEvent (db.Model):
    __tablename__ = "saving_event"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False)

    amount = db.Column(db.Float, nullable=False)
    currency = db.Column(db.String(10), nullable=False)

    created_at = db.Column(db.DateTime, nullable=False,
                           default=datetime.utcnow)

    def serialize(self):
        return {

            "id": self.id,
            "user_id": self.user_id,
            "amount": self.amount,
            "currency": self.currency,
            "created_at": self.created_at.isoformat()
        }


class RewardLedger (db.Model):
    __tablename__ = "reward_ledger"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False)

    credits_delta = db.Column(db.Integer, nullable=False)
    reason = db.Column(db.String(80), nullable=False)

    # Esto que agregare es opcional .. tengo que ver como encaja en el proyecto
    # Una tabla para saber cuanto ahorro se genero y se gasto

    saving_amount = db.Column(db.Float, nullable=True)
    currency = db.Column(db.String(10), nullable=True, default="USD")

    created_at = db.Column(db.DateTime, nullable=False,
                           default=datetime.utcnow)

    def serialize(self):
        return {

            "id": self.id,
            "user_id": self.user_id,
            "credits_delta": self.credits_delta,
            "reason": self.reason,
            "saving_amount": self.saving_amount,
            "currency": self.currency,
            "created_at": self.created_at.isoformat()
        }


class Group(db.Model):
    __tablename__ = "group"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False)

    owner_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False)
    created_at = db.Column(db.DateTime, nullable=False,
                           default=datetime.utcnow)

    def serialize(self):
        return {
            "id": self.id,
            "name": self.name,
            "owner_id": self.owner_id,
            "created_at": self.created_at.isoformat()
        }


class GroupMember(db.Model):
    __tablename__ = "group_member"

    id = db.Column(db.Integer, primary_key=True)
    group_id = db.Column(db.Integer, db.ForeignKey("group.id"), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False)
    role = db.Column(db.String(30), nullable=False, default="member")

    def serialize(self):
        return {
            "id": self.id,
            "group_id": self.group_id,
            "user_id": self.user_id,
            "role": self.role
        }


class SharedExpense(db.Model):
    __tablename__ = "shared_expense"

    id = db.Column(db.Integer, primary_key=True)
    group_id = db.Column(db.Integer, db.ForeignKey("group.id"), nullable=False)

    created_by = db.Column(
        db.Integer, db.ForeignKey("user.id"), nullable=False)

    title = db.Column(db.String(120), nullable=False)
    total_amount = db.Column(db.Float, nullable=False)
    currency = db.Column(db.String(10), nullable=False, default="USD")
    date = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)

    def serialize(self):
        return {
            "id": self.id,
            "group_id": self.group_id,
            "created_by": self.created_by,
            "title": self.title,
            "total_amount": self.total_amount,
            "currency": self.currency,
            "date": self.date.isoformat()
        }


class SharedExpenseSplit(db.Model):
    __tablename__ = "shared_expense_split"

    id = db.Column(db.Integer, primary_key=True)
    shared_expense_id = db.Column(db.Integer, db.ForeignKey(
        "shared_expense.id"), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False)

    amount = db.Column(db.Float, nullable=False)

    def serialize(self):
        return {
            "id": self.id,
            "shared_expense_id": self.shared_expense_id,
            "user_id": self.user_id,
            "amount": self.amount
        }
