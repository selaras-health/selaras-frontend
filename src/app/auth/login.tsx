/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState } from "react";
import { motion } from "framer-motion";
import {
    Eye,
    EyeOff,
    Mail,
    Lock,
    Loader2,
    ArrowRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { z } from "zod";
import { Link, useNavigate } from "react-router-dom";
import { login } from "@/hooks/api/auth";
import { useAuth } from "@/provider/AuthProvider";

// Validation schema
const loginSchema = z.object({
    email: z.string().email({ message: "Please enter a valid email address" }),
    password: z
        .string()
        .min(6, { message: "Password must be at least 6 characters" }),
});

type LoginFormData = z.infer<typeof loginSchema>;

const pageVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
};

const cardVariants = {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    transition: { duration: 0.3 },
};

const Login = () => {
    const auth = useAuth();
    const setToken = auth?.setToken;

    const navigate = useNavigate();
    const [formData, setFormData] = useState<LoginFormData>({
        email: "",
        password: "",
    });
    // const [remember, setRemember] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState<Partial<LoginFormData>>({});

    const handleInputChange = (field: keyof LoginFormData, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        // Clear error when user starts typing
        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: undefined }));
        }
    };

    const validateForm = () => {
        try {
            loginSchema.parse(formData);
            setErrors({});
            return true;
        } catch (error) {
            if (error instanceof z.ZodError) {
                const fieldErrors: Partial<LoginFormData> = {};
                error.errors.forEach((err) => {
                    if (err.path[0]) {
                        fieldErrors[err.path[0] as keyof LoginFormData] =
                            err.message;
                    }
                });
                setErrors(fieldErrors);
            }
            return false;
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;

        setIsLoading(true);

        try {
            const response = await login(formData.email, formData.password);

            if (response.success !== true) {
                setErrors({
                    email:
                        response.message || "Login failed. Please try again.",
                    password:
                        response.message || "Login failed. Please try again.",
                });
            } else {
                setToken?.(response.data.access_token);
                navigate("/dashboard");
            }
        } catch (error) {
            setErrors({
                email: "Login failed. Please try again.",
                password: "Login failed. Please try again.",
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-pink-50 flex items-center justify-center p-4">
            {/* Background decoration */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(244,63,94,0.1),transparent_50%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(244,63,94,0.05),transparent_50%)]" />

            <motion.div
                variants={pageVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ duration: 0.5 }}
                className="w-full max-w-md relative z-10"
            >
                <motion.div
                    variants={cardVariants}
                    initial="initial"
                    animate="animate"
                    className="mb-8 text-center"
                >
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">
                        Selamat Datang Kembali!
                    </h2>
                    <p className="text-gray-600">
                        Masuk ke akun Kamu untuk melanjutkan perjalananmu.
                    </p>
                </motion.div>

                <motion.div
                    variants={cardVariants}
                    initial="initial"
                    animate="animate"
                    transition={{ delay: 0.1 }}
                >
                    <Card className="rounded-2xl shadow-xl border border-gray-200 bg-white/80 backdrop-blur-sm">
                        <CardHeader className="pb-4">
                            <CardTitle className="text-xl font-bold text-gray-900 text-center">
                                Masuk Sekarang
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 pt-0">
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Email Field */}
                                <div className="space-y-2">
                                    <Label
                                        htmlFor="email"
                                        className="text-sm font-medium text-gray-700"
                                    >
                                        Alamat Email
                                    </Label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                                        <Input
                                            id="email"
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) =>
                                                handleInputChange(
                                                    "email",
                                                    e.target.value
                                                )
                                            }
                                            className={`pl-10 h-12 rounded-xl border-gray-300 focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-all duration-300 ${
                                                errors.email
                                                    ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                                                    : ""
                                            }`}
                                            placeholder="Enter your email"
                                            disabled={isLoading}
                                        />
                                    </div>
                                    {errors.email && (
                                        <motion.p
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="text-sm text-red-600"
                                        >
                                            {errors.email}
                                        </motion.p>
                                    )}
                                </div>

                                {/* Password Field */}
                                <div className="space-y-2">
                                    <Label
                                        htmlFor="password"
                                        className="text-sm font-medium text-gray-700"
                                    >
                                        Password
                                    </Label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                                        <Input
                                            id="password"
                                            type={
                                                showPassword
                                                    ? "text"
                                                    : "password"
                                            }
                                            value={formData.password}
                                            onChange={(e) =>
                                                handleInputChange(
                                                    "password",
                                                    e.target.value
                                                )
                                            }
                                            className={`pl-10 pr-10 h-12 rounded-xl border-gray-300 focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-all duration-300 ${
                                                errors.password
                                                    ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                                                    : ""
                                            }`}
                                            placeholder="Enter your password"
                                            disabled={isLoading}
                                        />
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setShowPassword(!showPassword)
                                            }
                                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                                            disabled={isLoading}
                                        >
                                            {showPassword ? (
                                                <EyeOff className="h-5 w-5" />
                                            ) : (
                                                <Eye className="h-5 w-5" />
                                            )}
                                        </button>
                                    </div>
                                    {errors.password && (
                                        <motion.p
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="text-sm text-red-600"
                                        >
                                            {errors.password}
                                        </motion.p>
                                    )}
                                </div>

                                {/*
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="remember"
                                            checked={remember}
                                            onCheckedChange={(checked) =>
                                                setRemember(checked as boolean)
                                            }
                                            disabled={isLoading}
                                            className="data-[state=checked]:bg-rose-500 data-[state=checked]:border-rose-500"
                                        />
                                        <Label
                                            htmlFor="remember"
                                            className="text-sm text-gray-700 cursor-pointer"
                                        >
                                            Remember me
                                        </Label>
                                    </div>
                                    <Link
                                        to="/forgot-password"
                                        className="text-sm text-rose-600 hover:text-rose-700 font-medium transition-colors"
                                    >
                                        Forgot password?
                                    </Link>
                                </div> */}

                                {/* Submit Button */}
                                <Button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full h-12 bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                                            Proses Masuk...
                                        </>
                                    ) : (
                                        <>
                                            Masuk Sekarang
                                            <ArrowRight className="h-5 w-5 ml-2" />
                                        </>
                                    )}
                                </Button>

                                {/* Divider */}
                                <div className="relative">
                                    <div className="absolute inset-0 flex items-center">
                                        <div className="w-full border-t border-gray-300" />
                                    </div>
                                    <div className="relative flex justify-center text-sm">
                                        <span className="px-2 bg-white text-gray-500">
                                            Belum punya akun?
                                        </span>
                                    </div>
                                </div>

                                {/* Register Link */}
                                <div className="text-center">
                                    <Link
                                        to="/auth/register"
                                        className="text-rose-600 hover:text-rose-700 font-semibold transition-colors"
                                    >
                                        Daftar Sekarang
                                    </Link>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Footer */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="mt-8 text-center text-sm text-gray-600"
                >
                    <p>
                        By signing in, you agree to our{" "}
                        <Link
                            to="/terms"
                            className="text-rose-600 hover:text-rose-700 font-medium"
                        >
                            Terms of Service
                        </Link>{" "}
                        and{" "}
                        <Link
                            to="/privacy"
                            className="text-rose-600 hover:text-rose-700 font-medium"
                        >
                            Privacy Policy
                        </Link>
                    </p>
                </motion.div>
            </motion.div>
        </div>
    );
};

export default Login;
