import { useState } from "react";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

interface EnrollmentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const enrollmentSchema = z.object({
  userEmail: z.string().email("Please enter a valid email address"),
  platform: z.string().min(1, "Please select a platform"),
  assignedGroup: z.string().optional(),
});

type EnrollmentFormValues = z.infer<typeof enrollmentSchema>;

export function EnrollmentModal({ isOpen, onClose }: EnrollmentModalProps) {
  const { toast } = useToast();
  const [qrCode, setQrCode] = useState<string | null>(null);
  
  const form = useForm<EnrollmentFormValues>({
    resolver: zodResolver(enrollmentSchema),
    defaultValues: {
      userEmail: "",
      platform: "",
      assignedGroup: "",
    },
  });
  
  const createTokenMutation = useMutation({
    mutationFn: async (data: EnrollmentFormValues) => {
      const res = await apiRequest("POST", "/api/enrollment/token", data);
      return await res.json();
    },
    onSuccess: (data) => {
      // In a real app, this would generate a QR code with the token
      setQrCode(data.token);
      
      toast({
        title: "Enrollment Link Created",
        description: "Enrollment link has been sent to the user",
      });
      
      queryClient.invalidateQueries({ queryKey: ["/api/devices"] });
      form.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  const onSubmit = (data: EnrollmentFormValues) => {
    createTokenMutation.mutate(data);
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Enroll New Device</DialogTitle>
        </DialogHeader>
        
        <div className="p-6">
          <div className="flex flex-col md:flex-row space-y-6 md:space-y-0 md:space-x-6">
            <div className="flex-1">
              <h4 className="font-medium text-neutral-800 mb-4">QR Code Enrollment</h4>
              <div className="bg-white border border-neutral-200 rounded-lg p-4 flex items-center justify-center">
                <div className="w-48 h-48 bg-neutral-100 rounded flex items-center justify-center">
                  {qrCode ? (
                    <div className="text-center">
                      <div className="text-xs text-neutral-500 mb-2">Scan with device camera</div>
                      <div className="border border-neutral-300 p-2 bg-white">
                        <div className="text-xs font-mono break-all">{qrCode}</div>
                      </div>
                    </div>
                  ) : (
                    <i className="fas fa-qrcode text-6xl text-neutral-400"></i>
                  )}
                </div>
              </div>
              <p className="text-sm text-neutral-600 mt-4 text-center">
                Scan with device camera to begin enrollment
              </p>
            </div>
            <div className="flex-1">
              <h4 className="font-medium text-neutral-800 mb-4">Email Enrollment Link</h4>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="userEmail"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>User Email</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="user@example.com" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="platform"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Device Platform</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select platform" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="ios">iOS</SelectItem>
                            <SelectItem value="android">Android</SelectItem>
                            <SelectItem value="ipados">iPadOS</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="assignedGroup"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Assign to Group</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select group" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="marketing">Marketing</SelectItem>
                            <SelectItem value="sales">Sales</SelectItem>
                            <SelectItem value="development">Development</SelectItem>
                            <SelectItem value="design">Design</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={createTokenMutation.isPending}
                  >
                    {createTokenMutation.isPending ? (
                      <>Sending... <i className="fas fa-spinner fa-spin ml-2"></i></>
                    ) : (
                      "Send Enrollment Link"
                    )}
                  </Button>
                </form>
              </Form>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
