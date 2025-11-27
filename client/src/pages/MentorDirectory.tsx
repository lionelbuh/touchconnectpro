import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Search, Filter, Star, Briefcase } from "lucide-react";

const mentors = [
  {
    id: 1,
    name: "Elena Rodriguez",
    role: "Ex-YCombinator Founder",
    specialties: ["SaaS", "Fundraising", "Product Market Fit"],
    rating: 4.9,
    image: "https://i.pravatar.cc/150?u=elena",
    bio: "I help early stage founders navigate the chaos of the first 12 months. Sold my last SaaS for $10M."
  },
  {
    id: 2,
    name: "David Chen",
    role: "Senior PM @ Google",
    specialties: ["Product Strategy", "UX/UI", "Growth"],
    rating: 4.8,
    image: "https://i.pravatar.cc/150?u=david",
    bio: "Product nerd with a passion for user-centric design. Let's validate your hypothesis before you build."
  },
  {
    id: 3,
    name: "Sarah Miller",
    role: "CMO @ TechGrowth",
    specialties: ["Marketing", "Branding", "GTM Strategy"],
    rating: 5.0,
    image: "https://i.pravatar.cc/150?u=sarah",
    bio: "Marketing is math + magic. I'll help you find your first 1000 true fans without spending a fortune on ads."
  },
  {
    id: 4,
    name: "James Wilson",
    role: "Angel Investor",
    specialties: ["Finance", "Pitch Deck", "Networking"],
    rating: 4.7,
    image: "https://i.pravatar.cc/150?u=james",
    bio: "Written checks for 20+ startups. I know what investors want to see in your deck."
  },
  {
    id: 5,
    name: "Anita Patel",
    role: "CTO @ FintechScale",
    specialties: ["Tech Stack", "Scaling", "Engineering Management"],
    rating: 4.9,
    image: "https://i.pravatar.cc/150?u=anita",
    bio: "Building scalable architecture on a budget. Don't over-engineer your MVP."
  },
  {
    id: 6,
    name: "Marcus Johnson",
    role: "Sales Director",
    specialties: ["B2B Sales", "Negotiation", "Partnerships"],
    rating: 4.8,
    image: "https://i.pravatar.cc/150?u=marcus",
    bio: "Closing deals is an art. I'll teach you how to sell your vision to enterprise clients."
  }
];

export default function MentorDirectory() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-12">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4">
          <div>
            <h1 className="text-4xl font-display font-bold text-slate-900 dark:text-white mb-2">Find Your Mentor</h1>
            <p className="text-muted-foreground max-w-xl">Connect with world-class experts who have walked the path before. Filter by industry, expertise, or role.</p>
          </div>
          
          <div className="flex gap-2 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search by name or skill..." className="pl-9 bg-white dark:bg-slate-900" />
            </div>
            <Button variant="outline" className="bg-white dark:bg-slate-900">
              <Filter className="mr-2 h-4 w-4" /> Filter
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mentors.map((mentor) => (
            <Card key={mentor.id} className="group hover:shadow-lg transition-all duration-300 border-slate-200 dark:border-slate-800 overflow-hidden">
              <CardHeader className="p-0">
                <div className="h-24 bg-gradient-to-r from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 relative">
                  <div className="absolute top-4 right-4 bg-white/90 dark:bg-slate-900/90 backdrop-blur px-2 py-1 rounded text-xs font-bold flex items-center gap-1 shadow-sm">
                    <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" /> {mentor.rating}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="px-6 pt-0 pb-4 relative">
                <div className="flex justify-between items-start">
                  <Avatar className="h-20 w-20 border-4 border-white dark:border-slate-950 -mt-10 shadow-sm">
                    <AvatarImage src={mentor.image} />
                    <AvatarFallback>{mentor.name.substring(0, 2)}</AvatarFallback>
                  </Avatar>
                  <div className="mt-4">
                     <Button size="sm" variant="outline" className="text-xs h-8 border-indigo-200 text-indigo-700 bg-indigo-50 hover:bg-indigo-100 hover:text-indigo-800">
                       Request
                     </Button>
                  </div>
                </div>
                
                <div className="mt-3">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-primary transition-colors">{mentor.name}</h3>
                  <p className="text-sm font-medium text-slate-500 flex items-center gap-1 mb-3">
                    <Briefcase className="h-3 w-3" /> {mentor.role}
                  </p>
                  <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 mb-4 leading-relaxed">
                    "{mentor.bio}"
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {mentor.specialties.map((tag, i) => (
                      <Badge key={i} variant="secondary" className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-normal hover:bg-slate-200">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
