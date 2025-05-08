import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocation } from "wouter";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Helmet } from "react-helmet";

// Login form schema
const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});
type LoginFormValues = z.infer<typeof loginSchema>;

// Registration form schema
const registerSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
  email: z.string().email("Invalid email address"),
  fullName: z.string().min(1, "Full name is required"),
  tenantId: z.number().default(1), // Using default tenant (1) for demo
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});
type RegisterFormValues = z.infer<typeof registerSchema>;

export default function AuthPage() {
  const [_, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState<string>("login");
  
  // Login form
  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });
  
  // Register form
  const registerForm = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      password: "",
      confirmPassword: "",
      email: "",
      fullName: "",
      tenantId: 1,
    },
  });
  
  const onLoginSubmit = (data: LoginFormValues) => {
    console.log('Login form submitted:', data);
    // Temporary placeholder for login functionality
    alert('Login functionality will be implemented once auth is fixed');
  };
  
  const onRegisterSubmit = (data: RegisterFormValues) => {
    console.log('Register form submitted:', data);
    // Temporary placeholder for registration functionality
    alert('Registration functionality will be implemented once auth is fixed');
  };
  
  return (
    <>
      <Helmet>
        <title>Login | DeviceHub MDM</title>
        <meta name="description" content="Log in to DeviceHub MDM to manage and control your organization's mobile devices." />
      </Helmet>
      
      <div className="min-h-screen bg-neutral-50 flex">
        {/* Left column with auth forms */}
        <div className="flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 w-full lg:w-1/2">
          <div className="sm:mx-auto sm:w-full sm:max-w-md">
            <div className="text-center">
              <div className="flex justify-center items-center mb-4">
                <i className="fas fa-mobile-alt text-3xl text-primary-500 mr-2"></i>
                <h1 className="text-3xl font-bold text-neutral-900">DeviceHub MDM</h1>
              </div>
              <h2 className="text-xl font-semibold text-neutral-900">
                {activeTab === "login" ? "Sign in to your account" : "Create a new account"}
              </h2>
              <p className="mt-2 text-sm text-neutral-600">
                {activeTab === "login" 
                  ? "Enter your credentials to access the dashboard" 
                  : "Register to manage your organization's devices"}
              </p>
            </div>
            
            <div className="mt-8">
              <Tabs defaultValue="login" value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid grid-cols-2 w-full">
                  <TabsTrigger value="login">Login</TabsTrigger>
                  <TabsTrigger value="register">Register</TabsTrigger>
                </TabsList>
                
                <TabsContent value="login">
                  <Card>
                    <CardHeader>
                      <CardTitle>Login</CardTitle>
                      <CardDescription>
                        Enter your username and password to sign in
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Form {...loginForm}>
                        <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                          <FormField
                            control={loginForm.control}
                            name="username"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Username</FormLabel>
                                <FormControl>
                                  <Input placeholder="username" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={loginForm.control}
                            name="password"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Password</FormLabel>
                                <FormControl>
                                  <Input 
                                    type="password" 
                                    placeholder="••••••••" 
                                    {...field} 
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <Button 
                            type="submit" 
                            className="w-full"
                          >
                            Sign in
                          </Button>
                        </form>
                      </Form>
                    </CardContent>
                    <CardFooter className="flex justify-center">
                      <p className="text-sm text-neutral-600">
                        Don't have an account?{" "}
                        <button
                          type="button"
                          className="text-primary-500 hover:text-primary-600 font-medium"
                          onClick={() => setActiveTab("register")}
                        >
                          Register
                        </button>
                      </p>
                    </CardFooter>
                  </Card>
                </TabsContent>
                
                <TabsContent value="register">
                  <Card>
                    <CardHeader>
                      <CardTitle>Register</CardTitle>
                      <CardDescription>
                        Create a new account to get started
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Form {...registerForm}>
                        <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
                          <FormField
                            control={registerForm.control}
                            name="fullName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Full Name</FormLabel>
                                <FormControl>
                                  <Input placeholder="John Doe" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={registerForm.control}
                            name="email"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Email</FormLabel>
                                <FormControl>
                                  <Input 
                                    type="email" 
                                    placeholder="john@example.com" 
                                    {...field} 
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={registerForm.control}
                            name="username"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Username</FormLabel>
                                <FormControl>
                                  <Input placeholder="johndoe" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={registerForm.control}
                            name="password"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Password</FormLabel>
                                <FormControl>
                                  <Input 
                                    type="password" 
                                    placeholder="••••••••" 
                                    {...field} 
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={registerForm.control}
                            name="confirmPassword"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Confirm Password</FormLabel>
                                <FormControl>
                                  <Input 
                                    type="password" 
                                    placeholder="••••••••" 
                                    {...field} 
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <Button 
                            type="submit" 
                            className="w-full"
                          >
                            Create account
                          </Button>
                        </form>
                      </Form>
                    </CardContent>
                    <CardFooter className="flex justify-center">
                      <p className="text-sm text-neutral-600">
                        Already have an account?{" "}
                        <button
                          type="button"
                          className="text-primary-500 hover:text-primary-600 font-medium"
                          onClick={() => setActiveTab("login")}
                        >
                          Sign in
                        </button>
                      </p>
                    </CardFooter>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
        
        {/* Right column with branding and benefits */}
        <div className="hidden lg:block lg:w-1/2 bg-primary-500 text-white">
          <div className="flex flex-col justify-center h-full p-12">
            <div className="mb-8">
              <i className="fas fa-mobile-alt text-5xl mb-4"></i>
              <h2 className="text-3xl font-bold mb-4">
                Manage your mobile devices with ease
              </h2>
              <p className="text-lg opacity-90 mb-8">
                DeviceHub MDM provides comprehensive management solutions for iOS and Android devices.
              </p>
            </div>
            
            <div className="space-y-6">
              <div className="flex items-start">
                <div className="bg-primary-400 p-2 rounded-full mr-4">
                  <i className="fas fa-shield-alt text-lg"></i>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-1">Secure Management</h3>
                  <p className="opacity-80">Protect corporate data with advanced security features</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="bg-primary-400 p-2 rounded-full mr-4">
                  <i className="fas fa-desktop text-lg"></i>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-1">Remote Control</h3>
                  <p className="opacity-80">Provide real-time support with remote viewing capabilities</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="bg-primary-400 p-2 rounded-full mr-4">
                  <i className="fas fa-chart-bar text-lg"></i>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-1">Analytics & Reporting</h3>
                  <p className="opacity-80">Track device health and compliance with detailed reporting</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
