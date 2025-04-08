import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { NutritionEntry, insertNutritionEntrySchema } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Form, 
  FormControl,
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { 
  ArrowDown, 
  ArrowUp, 
  CalendarIcon, 
  CakeSlice, 
  Loader2, 
  Plus,
  ShoppingBasket
} from "lucide-react";
import { format, isToday } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";

// Extend the nutrition schema with validation rules
const nutritionFormSchema = insertNutritionEntrySchema.extend({
  // Only use string for date fields - simpler
  date: z.string(),
  calories: z.coerce.number().min(1, "Calories must be at least 1"),
  protein: z.coerce.number().transform(val => val?.toString()).optional(),
  carbs: z.coerce.number().transform(val => val?.toString()).optional(),
  fat: z.coerce.number().transform(val => val?.toString()).optional(),
});

type NutritionFormData = z.infer<typeof nutritionFormSchema>;

export default function Nutrition() {
  const userId = 1; // In a real app, this would come from auth context
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isAddingEntry, setIsAddingEntry] = useState(false);
  
  const { data: nutritionEntries, isLoading } = useQuery<NutritionEntry[]>({
    queryKey: [`/api/users/${userId}/nutrition`],
  });
  
  // Initialize form
  const form = useForm<NutritionFormData>({
    resolver: zodResolver(nutritionFormSchema),
    defaultValues: {
      userId,
      date: new Date().toISOString().split('T')[0], // Use string format YYYY-MM-DD
      calories: 0,
      protein: "0", // Use string for numeric type fields as expected by schema
      carbs: "0",   // Use string for numeric type fields as expected by schema
      fat: "0",     // Use string for numeric type fields as expected by schema
      notes: "",
    },
  });
  
  // Create nutrition entry mutation
  const createEntryMutation = useMutation({
    mutationFn: async (data: NutritionFormData) => {
      // Format all fields to match server expectations
      // We'll send the date as is - our schema will handle conversion
      const formattedData = {
        userId: data.userId,
        date: data.date, // Schema can now handle both string and Date objects
        calories: Number(data.calories),
        protein: data.protein, // Already transformed to string by schema
        carbs: data.carbs,     // Already transformed to string by schema
        fat: data.fat,         // Already transformed to string by schema
        notes: data.notes,
      };
      
      console.log("Submitting nutrition entry:", formattedData);
      try {
        const response = await apiRequest("POST", "/api/nutrition", formattedData);
        console.log("API response:", response);
        return await response.json();
      } catch (error) {
        console.error("API request failed:", error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/users/${userId}/nutrition`] });
      setIsAddingEntry(false);
      form.reset({
        userId,
        date: new Date().toISOString().split('T')[0], // Use string format YYYY-MM-DD
        calories: 0,
        protein: "0", // Use string for numeric type fields
        carbs: "0",   // Use string for numeric type fields
        fat: "0",     // Use string for numeric type fields
        notes: "",
      });
      toast({
        title: "Entry added",
        description: "Your nutrition entry has been added successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to add nutrition entry: " + error.message,
        variant: "destructive",
      });
    },
  });
  
  // Calculate daily totals
  const calculateDailyTotal = (entries: NutritionEntry[] | undefined) => {
    if (!entries?.length) return 0;
    
    // Get today's entries
    const today = new Date().toISOString().split('T')[0];
    const todayEntries = entries.filter(entry => {
      const entryDate = new Date(entry.date).toISOString().split('T')[0];
      return entryDate === today;
    });
    
    // Sum the calories
    return todayEntries.reduce((total, entry) => total + entry.calories, 0);
  };
  
  // Form submit handler
  const onSubmit = (data: NutritionFormData) => {
    createEntryMutation.mutate(data);
  };
  
  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32 mb-2" />
              <Skeleton className="h-4 w-48" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-24 w-full" />
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32 mb-2" />
              <Skeleton className="h-4 w-48" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-24 w-full" />
            </CardContent>
          </Card>
        </div>
        
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent>
            {[1, 2, 3].map(i => (
              <div key={i} className="mb-4 p-4 border rounded-lg">
                <div className="flex justify-between mb-2">
                  <Skeleton className="h-6 w-24" />
                  <Skeleton className="h-6 w-32" />
                </div>
                <Skeleton className="h-4 w-full mb-2" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }
  
  const dailyCalories = calculateDailyTotal(nutritionEntries);
  const targetCalories = 2400; // This would come from user settings in a real app
  const dailyPercentage = Math.min(100, (dailyCalories / targetCalories) * 100);
  const recentEntries = nutritionEntries?.slice(0, 10);
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Nutrition Tracking</h1>
        <Dialog open={isAddingEntry} onOpenChange={setIsAddingEntry}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Add Meal
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add Nutrition Entry</DialogTitle>
              <DialogDescription>
                Enter the details of your meal or snack.
              </DialogDescription>
            </DialogHeader>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date (YYYY-MM-DD)</FormLabel>
                      <FormControl>
                        <Input 
                          type="text" 
                          placeholder="YYYY-MM-DD" 
                          value={String(field.value)}
                          onChange={(e) => {
                            // Pass the date string directly to the form
                            field.onChange(e.target.value);
                          }}
                        />
                      </FormControl>
                      <FormDescription>
                        Enter the date in YYYY-MM-DD format (e.g., 2025-04-08)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="calories"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Calories</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="protein"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Protein (g)</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="carbs"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Carbs (g)</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="fat"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Fat (g)</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Meal Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Describe what you ate"
                          {...field}
                          value={field.value || ''}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="flex justify-end space-x-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsAddingEntry(false)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit"
                    disabled={createEntryMutation.isPending}
                  >
                    {createEntryMutation.isPending && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Save Entry
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Today's Calories</CardTitle>
            <CardDescription>Your daily intake and target</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center mb-4">
              <div className="text-4xl font-bold mr-4">{dailyCalories}</div>
              <div className="text-sm text-gray-500">
                <div>of {targetCalories} target</div>
                <div className="flex items-center">
                  {dailyCalories > targetCalories ? (
                    <>
                      <ArrowUp className="text-red-500 h-4 w-4 mr-1" />
                      <span className="text-red-500">
                        {dailyCalories - targetCalories} over
                      </span>
                    </>
                  ) : (
                    <>
                      <ArrowDown className="text-green-500 h-4 w-4 mr-1" />
                      <span className="text-green-500">
                        {targetCalories - dailyCalories} under
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
            <div className="h-2 bg-gray-100 rounded">
              <div 
                className={`h-2 rounded ${
                  dailyCalories > targetCalories 
                    ? 'bg-red-500' 
                    : 'bg-primary'
                }`}
                style={{ width: `${dailyPercentage}%` }}
              ></div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Nutrition Breakdown</CardTitle>
            <CardDescription>Today's macronutrients</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-lg font-semibold text-blue-500">
                  {nutritionEntries
                    ?.filter(entry => isToday(new Date(entry.date)))
                    .reduce((sum, entry) => sum + (Number(entry.protein) || 0), 0)}g
                </div>
                <div className="text-sm text-gray-500">Protein</div>
              </div>
              <div>
                <div className="text-lg font-semibold text-green-500">
                  {nutritionEntries
                    ?.filter(entry => isToday(new Date(entry.date)))
                    .reduce((sum, entry) => sum + (Number(entry.carbs) || 0), 0)}g
                </div>
                <div className="text-sm text-gray-500">Carbs</div>
              </div>
              <div>
                <div className="text-lg font-semibold text-yellow-500">
                  {nutritionEntries
                    ?.filter(entry => isToday(new Date(entry.date)))
                    .reduce((sum, entry) => sum + (Number(entry.fat) || 0), 0)}g
                </div>
                <div className="text-sm text-gray-500">Fat</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Recent Entries */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Entries</CardTitle>
        </CardHeader>
        <CardContent>
          {!recentEntries?.length ? (
            <div className="text-center py-8">
              <ShoppingBasket className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-700 mb-2">No entries yet</h3>
              <p className="text-gray-500 mb-4">Start tracking your nutrition</p>
              <Button onClick={() => setIsAddingEntry(true)}>
                <Plus className="mr-2 h-4 w-4" /> Add First Entry
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {recentEntries.map(entry => (
                <div key={entry.id} className="p-4 border rounded-lg">
                  <div className="flex justify-between mb-2">
                    <div className="flex items-center">
                      <CakeSlice className="h-5 w-5 mr-2 text-primary" />
                      <span className="font-medium">{entry.calories} calories</span>
                    </div>
                    <span className="text-sm text-gray-500">
                      {format(new Date(entry.date), 'MMM d, h:mm a')}
                    </span>
                  </div>
                  {entry.notes && (
                    <p className="text-gray-600 text-sm">{entry.notes}</p>
                  )}
                  <div className="flex text-xs text-gray-500 mt-2 space-x-2">
                    {entry.protein && <span>Protein: {entry.protein}g</span>}
                    {entry.carbs && <span>Carbs: {entry.carbs}g</span>}
                    {entry.fat && <span>Fat: {entry.fat}g</span>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
