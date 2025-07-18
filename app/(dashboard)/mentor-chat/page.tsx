import AIMentorChat from '../../../components/AIMentorChat';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function MentorChatPage() {
  return (
    <div className="min-h-screen bg-gradient-metro p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <Card className="bg-card/80 backdrop-blur-sm border-primary/20 shadow-lg">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-primary">AI Career Mentor</CardTitle>
            <CardDescription className="text-lg">
              Get personalized career guidance, code reviews, and daily motivation
            </CardDescription>
          </CardHeader>
        </Card>
        
        <div className="w-full">
          <AIMentorChat />
        </div>
      </div>
    </div>
  );
} 