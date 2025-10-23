'use client'
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function CustomClerkPricing() {
    const { theme } = useTheme()
    
    const plans = [
        {
            name: "Starter",
            price: "$9",
            period: "/month",
            description: "Perfect for individuals getting started",
            features: ["Up to 5 projects", "Basic support", "1GB storage"],
            popular: false
        },
        {
            name: "Pro",
            price: "$29",
            period: "/month", 
            description: "Best for growing teams",
            features: ["Unlimited projects", "Priority support", "10GB storage", "Advanced analytics"],
            popular: true
        },
        {
            name: "Enterprise",
            price: "$99",
            period: "/month",
            description: "For large organizations",
            features: ["Everything in Pro", "Custom integrations", "100GB storage", "Dedicated support", "SLA guarantee"],
            popular: false
        }
    ]

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((plan) => (
                <Card key={plan.name} className={`relative ${plan.popular ? 'border-primary shadow-lg' : ''}`}>
                    {plan.popular && (
                        <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-primary">
                            Most Popular
                        </Badge>
                    )}
                    <CardHeader>
                        <CardTitle className="text-2xl">{plan.name}</CardTitle>
                        <CardDescription>{plan.description}</CardDescription>
                        <div className="text-4xl font-bold">
                            {plan.price}
                            <span className="text-lg font-normal text-muted-foreground">{plan.period}</span>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-2 mb-6">
                            {plan.features.map((feature, index) => (
                                <li key={index} className="flex items-center">
                                    <span className="text-green-500 mr-2">✓</span>
                                    {feature}
                                </li>
                            ))}
                        </ul>
                        <Button 
                            className="w-full" 
                            variant={plan.popular ? "default" : "outline"}
                        >
                            Get Started
                        </Button>
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}