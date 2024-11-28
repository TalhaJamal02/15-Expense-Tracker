"use client";

import React, { useState, useEffect, ChangeEvent } from "react";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "./ui/dialog";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { FilePenIcon, PlusIcon, TrashIcon } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

type Expense = {
  id: number
  name: string
  amount: number
  date: Date
}

const initialExpenses: Expense[] = [
  {
    id: 1,
    name: "Groceries",
    amount: 300,
    date: new Date("2024-11-04"),
  },
  {
    id: 2,
    name: "Dining Out",
    amount: 100,
    date: new Date("2024-11-28"),
  },
  {
    id: 3,
    name: "Internet Subscription",
    amount: 50,
    date: new Date("2024-11-15"),
  },
  {
    id: 4,
    name: "Transportation",
    amount: 150,
    date: new Date("2024-11-18"),
  },
  {
    id: 5,
    name: "Entertainment",
    amount: 100,
    date: new Date("2024-11-22"),
  },
];


function ExpenseTracker() {

  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [currentExpenseId, setCurrentExpenseId] = useState<number | null>(null);
  const [newExpense, setNewExpense] = useState<{ name: string; amount: string; date: Date }>({
    name: "",
    amount: "",
    date: new Date(),
  });

  useEffect(() => {
    const storedExpenses = localStorage.getItem("expenses");
    if (storedExpenses) {
      setExpenses(JSON.parse(storedExpenses).map((expense: Expense) => ({
        ...expense,
        date: new Date(expense.date),
      })));
    } else {
      setExpenses(initialExpenses);
    }
  }, []);

  useEffect(() => {
    if (expenses.length > 0) {
      localStorage.setItem("expenses", JSON.stringify(expenses));
    }
  }, [expenses]);

  const handleAddExpense = (): void => {
    if (!newExpense.name.trim()) {
      toast("Expense name is required.");
      return;
    }
    if (!newExpense.amount || isNaN(parseFloat(newExpense.amount)) || parseFloat(newExpense.amount) <= 0) {
      toast("A valid amount is required.");
      return;
    }
    if (!newExpense.date || isNaN(new Date(newExpense.date).getTime())) {
      toast("A valid date is required.");
      return;
    }

    setExpenses([
      ...expenses,
      {
        id: expenses.length + 1,
        name: newExpense.name,
        amount: parseFloat(newExpense.amount),
        date: new Date(newExpense.date),
      },
    ]);
    resetForm();
    setShowModal(false);
  };


  const handleEditExpense = (id: number): void => {
    const expenseToEdit = expenses.find((expense) => expense.id === id);
    if (expenseToEdit) {
      setNewExpense({
        name: expenseToEdit.name,
        amount: expenseToEdit.amount.toString(),
        date: expenseToEdit.date,
      });
      setCurrentExpenseId(id);
      setIsEditing(true);
      setShowModal(true);
    }
  };

  const handleSaveEditExpense = (): void => {
    setExpenses(
      expenses.map((expense) =>
        expense.id === currentExpenseId ? { ...expense, ...newExpense, amount: parseFloat(newExpense.amount) } : expense
      )
    );
    resetForm();
    setShowModal(false);
  };

  const resetForm = (): void => {
    setNewExpense({
      name: "",
      amount: "",
      date: new Date(),
    });
    setIsEditing(false);
    setCurrentExpenseId(null);
  };
  const handleDeleteExpense = (id: number): void => {
    setExpenses(expenses.filter((expense) => expense.id !== id));
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const { id, value } = e.target;
    setNewExpense((prevExpense) => ({
      ...prevExpense,
      [id]:
        id === "amount"
          ? parseFloat(value)
          : id === "date"
            ? new Date(value)
            : value,
    }));
  };
  const totalExpenses = expenses.reduce((total, expense) => total + expense.amount, 0);

  return (
    <div>
      <div className="flex flex-col h-screen">
        <header className="bg-primary text-primary-foreground py-4 px-6 shadow">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">Expense Tracker</h1>
            <div className="text-2xl font-bold">Total: ${totalExpenses.toFixed(2)}</div>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-6">
          <ul className="space-y-4">
            {expenses.map((expense) => (
              <li key={expense.id} className="bg-card p-4 rounded-lg shadow-lg flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-medium">{expense.name}</h3>
                  <p className="text-muted-foreground">${expense.amount.toFixed(2)} - {format(expense.date, "dd/MM/yyyy")}</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="icon" onClick={() => handleEditExpense(expense.id)}>
                    <FilePenIcon className="w-6 h-6" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDeleteExpense(expense.id)}>
                    <TrashIcon className="w-6 h-6" />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        </main>
        <div className="fixed bottom-6 right-6">
          <Button size="icon" className="rounded-full shadow-lg" onClick={() => { setShowModal(true); setIsEditing(false); resetForm(); }}>
            <PlusIcon className="w-6 h-6" />
          </Button>
        </div>
        <Dialog open={showModal} onOpenChange={setShowModal}>
          <DialogContent className="bg-card p-6 rounded-lg shadow w-full max-w-md">
            <DialogHeader>
              <DialogTitle>{isEditing ? "Edit Expense" : "Add Expense"}</DialogTitle>
            </DialogHeader>
            <div>
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Expense Name</Label>
                  <Input id="name" required value={newExpense.name} onChange={handleInputChange} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="amount">Amount</Label>
                  <Input id="amount" type="number" required value={newExpense.amount} onChange={handleInputChange} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="date">Date</Label>
                  <Input id="date" type="date" required value={newExpense.date.toISOString().slice(0, 10)} onChange={handleInputChange} />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowModal(false)}>Cancel</Button>
              <Button onClick={isEditing ? handleSaveEditExpense : handleAddExpense}>{isEditing ? "Save Changes" : "Add Expense"}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}

export default ExpenseTracker