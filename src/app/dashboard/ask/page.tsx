"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
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

  return (
    <main className="p-4">
      <h1 className="text-2xl font-bold mb-4">Ask a Dumb Question</h1>
      <form onSubmit={handleQuestionSubmit} className="mb-4 flex gap-2">
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
                  <p className="font-bold">Question: {question.text}</p>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center">
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
