import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Image, Users } from 'lucide-react';

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Welcome to the Admin Dashboard</h1>
      
      <div className="grid gap-4 md:grid-cols-3">
        <StatsCard
          title="Total Events"
          value="5"
          description="Upcoming events"
          icon={<Calendar className="h-6 w-6" />}
        />
        <StatsCard
          title="Gallery Images"
          value="24"
          description="Total uploaded images"
          icon={<Image className="h-6 w-6" />}
        />
        <StatsCard
          title="Members"
          value="150"
          description="Registered members"
          icon={<Users className="h-6 w-6" />}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Events</CardTitle>
            <CardDescription>Latest scheduled events</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Add event list here */}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Gallery Uploads</CardTitle>
            <CardDescription>Latest images added to the gallery</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Add gallery preview here */}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatsCard({
  title,
  value,
  description,
  icon,
}: {
  title: string;
  value: string;
  description: string;
  icon: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}
