import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { insertGoalSchema } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel,
  FormMessage,
  FormDescription
} from "@/components/ui/form";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";
import { CalendarIcon, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Create new goal form schema with validation rules
const goalFormSchema = z.object({
  userId: z.number(),
  name: z.string().min(3, "Goal name must be at least 3 characters"),
  description: z.string().min(5, "Please provide a brief description"),
  targetDate: z.any(), // Handle both date objects and strings
  currentValue: z.coerce.number(),
  targetValue: z.coerce.number().min(0.1, "Target value must be greater than 0"),
  unit: z.string(),
  status: z.string(),
});

type GoalFormData = z.infer<typeof goalFormSchema>;

interface GoalFormProps {
  userId: number;
}

export default function GoalForm({ userId }: GoalFormProps) {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Initialize the form
  const form = useForm<GoalFormData>({
    resolver: zodResolver(goalFormSchema),
    defaultValues: {
      userId,
      name: "",
      description: "",
      targetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days from now as YYYY-MM-DD
      currentValue: 0,
      targetValue: 0,
      unit: "lbs",
      status: "in-progress",
    },
  });
  
  // Handle goal submission
  const createGoalMutation = useMutation({
    mutationFn: async (data: GoalFormData) => {
      // Make sure targetDate is passed as a string
      const formattedData = {
        ...data,
        targetDate: typeof data.targetDate === 'string' ? 
          data.targetDate : 
          new Date(data.targetDate).toISOString().split('T')[0],
      };
      
      const response = await apiRequest("POST", "/api/goals", formattedData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/users/${userId}/goals`] });
      toast({
        title: "Goal created",
        description: "Your fitness goal has been set. You can do this!",
      });
      setLocation("/goals");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create goal. " + error.message,
        variant: "destructive",
      });
    },
  });
  
  // Form submit handler
  const onSubmit = (data: GoalFormData) => {
    createGoalMutation.mutate(data);
  };
  
  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>Set a New Fitness Goal</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Goal Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Lose Weight, Run 5K, Improve Strength" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Why is this goal important to you?"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="targetDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Target Date (YYYY-MM-DD)</FormLabel>
                    <FormControl>
                      <Input 
                        type="text" 
                        placeholder="YYYY-MM-DD" 
                        value={typeof field.value === 'object' ? 
                          new Date(field.value).toISOString().split('T')[0] :
                          String(field.value)}
                        onChange={(e) => {
                          field.onChange(e.target.value);
                        }}
                      />
                    </FormControl>
                    <FormDescription>
                      When do you want to achieve this goal? Format: YYYY-MM-DD
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="unit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Measurement Unit</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select unit" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="lbs">Pounds (lbs)</SelectItem>
                        <SelectItem value="kg">Kilograms (kg)</SelectItem>
                        <SelectItem value="miles">Miles</SelectItem>
                        <SelectItem value="km">Kilometers (km)</SelectItem>
                        <SelectItem value="minutes">Minutes</SelectItem>
                        <SelectItem value="reps">Repetitions</SelectItem>
                        <SelectItem value="days">Days</SelectItem>
                        <SelectItem value="%">Percentage (%)</SelectItem>
                        <SelectItem value="in">Inches (in)</SelectItem>
                        <SelectItem value="cm">Centimeters (cm)</SelectItem>
                        <SelectItem value="K">K (distance)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      How will you measure your progress?
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="currentValue"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current Value</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.1" {...field} />
                    </FormControl>
                    <FormDescription>
                      Your starting point
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="targetValue"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Target Value</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.1" {...field} />
                    </FormControl>
                    <FormDescription>
                      Your goal to achieve
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="pt-4 flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setLocation("/goals")}
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                disabled={createGoalMutation.isPending}
              >
                {createGoalMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Save Goal
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
