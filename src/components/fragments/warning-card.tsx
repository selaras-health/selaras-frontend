import { TriangleAlert } from "lucide-react";
import { Card, CardContent, CardHeader } from "../ui/card";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

export default function WarningCard(props: any) {
    const {
        title,
        description,
        btnText,
        btnHref
    } = props;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="min-h-screen bg-white flex items-center justify-center p-4 md:p-8"
        >
            <Card className="w-full max-w-md border-rose-100 shadow-xl bg-white">
                <CardHeader className="text-center space-y-4 pt-0">
                    {/* Icon */}
                    <div className="mx-auto w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center">
                        <TriangleAlert className="h-8 w-8 text-rose-600 fill-rose-100" />
                    </div>

                    {/* Header */}
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                        {title}
                    </h2>

                    {/* Description */}
                    <p className="text-gray-600 text-base leading-relaxed px-2 mb-5">
                        {description}
                    </p>
                </CardHeader>

                <CardContent className="space-y-6">
                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-3">
                        <Link to={btnHref} className=" text-center rounded-lg flex-1 bg-rose-600 hover:bg-rose-700 text-white font-medium py-2.5">
                            {btnText}
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
}
