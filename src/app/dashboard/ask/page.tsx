"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import { Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";

const Ask = () => {
  const storeUser = useMutation(api.users.store);
  const createQuestion = useMutation(api.questions.create);
  const likeQuestion = useMutation(api.questions.like);
  const auth = useAuth();
  const [newQuestion, setNewQuestion] = useState<string>("");

  const questions = useQuery(api.questions.list);
  const isAdmin = useQuery(api.users.isAdmin);
  const deleteQuestion = useMutation(api.questions.deleteQuestion);
  const userId = useQuery(api.users.getCurrentUserId);

  useEffect(() => {
    if (auth.isSignedIn && auth.isLoaded) storeUser();
  }, [storeUser, auth]);

  const handleQuestionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newQuestion.trim() !== "") {
      await createQuestion({ text: newQuestion });
      setNewQuestion("");
    }
  };

  const handleLike = async (questionId: Id<"questions">) => {
    await likeQuestion({ questionId });
  };

  const handleDelete = async (questionId: Id<"questions">) => {
    if (window.confirm("Are you sure you want to delete this question?")) {
      await deleteQuestion({ questionId });
    }
  };

  return (
    <main className="p-4">
      <h1 className="mb-4 text-2xl font-bold">Ask a Dumb Question</h1>
      <form onSubmit={handleQuestionSubmit} className="flex gap-2 mb-4">
        <Input
          disabled={!auth.isLoaded}
          type="text"
          value={newQuestion}
          onChange={(e) => setNewQuestion(e.target.value)}
          placeholder="Enter your question"
        />
        <Button type="submit" disabled={!auth.isLoaded}>
          Post Question
        </Button>
      </form>
      <div className="space-y-4">
        {!questions
          ? Array(10)
              .fill(null)
              .map((_, i) => <Skeleton key={i} className="h-32 rounded-lg" />)
          : questions.map((question) => (
              <Card key={question._id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <p className="font-bold">Question: {question.text}</p>
                    {(isAdmin || question.userId === userId) && (
                      <Button
                        variant="destructive"
                        size="icon"
                        onClick={() => handleDelete(question._id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">Likes: {question.likes}</h3>
                    <Button onClick={() => handleLike(question._id)}>
                      Like
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
      </div>
    </main>
  );
};

export default Ask;
