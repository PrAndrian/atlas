"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "@/components/ui/use-toast";
import { useMutation, useQuery } from "convex/react";
import { format } from "date-fns";
import { AlertTriangle, Trash2 } from "lucide-react";
import { useState } from "react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";

export default function ManageQuestionsPage() {
  const questions = useQuery(api.questions.listWithDetails);
  const deleteQuestion = useMutation(api.questions.deleteQuestion);
  const [isDeleting, setIsDeleting] = useState<Id<"questions"> | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async (
    questionId: Id<"questions">,
    questionText: string
  ) => {
    // Ask for confirmation before deleting
    if (
      !window.confirm(
        `Are you sure you want to delete the question: "${questionText}"?`
      )
    ) {
      return;
    }

    try {
      setIsDeleting(questionId);
      setError(null);
      await deleteQuestion({ questionId });
      toast({
        title: "Question deleted",
        description: "The question has been successfully deleted.",
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      setError(errorMessage);
      toast({
        title: "Error",
        description: `Failed to delete the question: ${errorMessage}`,
        variant: "destructive",
      });
      console.error("Error deleting question:", error);
    } finally {
      setIsDeleting(null);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Manage Questions</h1>
          <p className="text-muted-foreground">
            View and delete questions submitted by users
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-destructive/15 text-destructive p-4 rounded-md mb-6">
          <h3 className="font-semibold">Error</h3>
          <p>{error}</p>
        </div>
      )}

      <Separator className="my-6" />

      <Card>
        <CardHeader>
          <CardTitle>All Questions</CardTitle>
          <CardDescription>
            {questions?.length
              ? `Showing ${questions.length} question${
                  questions.length === 1 ? "" : "s"
                }`
              : "Loading questions..."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!questions ? (
            <div className="space-y-2">
              {Array(5)
                .fill(null)
                .map((_, i) => (
                  <Skeleton key={i} className="h-12 rounded-lg" />
                ))}
            </div>
          ) : questions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <AlertTriangle className="h-10 w-10 text-muted-foreground mb-2" />
              <h3 className="text-lg font-semibold">No questions found</h3>
              <p className="text-muted-foreground">
                There are no questions in the database yet.
              </p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Question</TableHead>
                    <TableHead>Likes</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {questions.map((question) => (
                    <TableRow key={question._id}>
                      <TableCell className="font-medium">
                        {question.text}
                      </TableCell>
                      <TableCell>{question.likes}</TableCell>
                      <TableCell>
                        {question.user?.email || "Unknown user"}
                      </TableCell>
                      <TableCell>
                        {question._creationTime
                          ? format(
                              new Date(question._creationTime),
                              "MMM dd, yyyy"
                            )
                          : "Unknown"}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="destructive"
                          size="icon"
                          onClick={() =>
                            handleDelete(question._id, question.text)
                          }
                          disabled={isDeleting === question._id}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between items-center">
          <p className="text-sm text-muted-foreground">
            Use the trash icon to delete a question
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
