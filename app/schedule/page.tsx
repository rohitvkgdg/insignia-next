import { Suspense } from "react"
import { Phone, Calendar, MapPin } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { promises as fs } from 'fs'
import path from 'path'

interface Coordinator {
  name: string;
  contact: string;
}

interface BaseEvent {
  name: string;
  venue: string;
  startTime: string;
  endTime: string;
}

interface CentralizedEvent extends BaseEvent {
  category: string;
  coordinators: Coordinator[];
}

interface TechnicalEvent extends BaseEvent {
  department: string;
  coordinators: Coordinator[];
}

interface CulturalEvent extends BaseEvent {
  category: string;
  coordinators: Coordinator[];
}

interface ScheduleDay<T> {
  dayNumber: number;
  date: string;
  events: T[];
}

interface ScheduleData<T> {
  eventTitle: string;
  college: string;
  days: ScheduleDay<T>[];
}

function parseTimeToMinutes(timeStr: string): number {
  if (!timeStr) return -1;
  
  const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
  if (!match) return -1;

  let [_, hoursStr, minutesStr, meridiem] = match;
  let hours = parseInt(hoursStr);
  let totalMinutes = parseInt(minutesStr);
  
  if (meridiem.toUpperCase() === 'PM' && hours !== 12) {
    hours += 12;
  } else if (meridiem.toUpperCase() === 'AM' && hours === 12) {
    hours = 0;
  }
  
  totalMinutes += hours * 60;
  return totalMinutes;
}

function sortEventsByTime<T extends BaseEvent>(events: T[]): T[] {
  return [...events].sort((a, b) => {
    const timeA = parseTimeToMinutes(a.startTime);
    const timeB = parseTimeToMinutes(b.startTime);
    return timeA - timeB;
  });
}

async function getScheduleData() {
  const [technicalPath, culturalPath, centralizedPath] = [
    path.join(process.cwd(), 'public', 'technical-schedule.json'),
    path.join(process.cwd(), 'public', 'cultural-schedule.json'),
    path.join(process.cwd(), 'public', 'centralized-schedule.json')
  ];

  const [technicalJson, culturalJson, centralizedJson] = await Promise.all([
    fs.readFile(technicalPath, 'utf8'),
    fs.readFile(culturalPath, 'utf8'),
    fs.readFile(centralizedPath, 'utf8')
  ]);

  return {
    technical: JSON.parse(technicalJson) as ScheduleData<TechnicalEvent>,
    cultural: JSON.parse(culturalJson) as ScheduleData<CulturalEvent>,
    centralized: JSON.parse(centralizedJson) as ScheduleData<CentralizedEvent>
  };
}

export default async function SchedulesPage() {
  const scheduleData = await getScheduleData();
  const { technical, cultural, centralized } = scheduleData;

  return (
    <div className="container max-w-7xl py-36 md:py-36">
      <div className="flex flex-col items-start gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Schedule</h1>
          <p className="text-muted-foreground">View event schedules by category</p>
        </div>
      </div>

      <div className="mt-8">
        <Tabs defaultValue="centralized" className="w-full">
          <TabsList className="mb-4 h-auto p-1 grid grid-cols-3 gap-1">
            <TabsTrigger value="centralized" className="px-3 py-1.5 h-auto data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              Centralized
            </TabsTrigger>
            <TabsTrigger value="technical" className="px-3 py-1.5 h-auto data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              Technical
            </TabsTrigger>
            <TabsTrigger value="cultural" className="px-3 py-1.5 h-auto data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              Cultural
            </TabsTrigger>
          </TabsList>

          <TabsContent value="centralized">
            <Card>
              <CardHeader>
                <CardTitle>Centralized Events</CardTitle>
                <CardDescription>Common events for all departments</CardDescription>
              </CardHeader>
              <CardContent className="px-2 md:px-6">
                {centralized.days.map((day, dayIndex) => (
                  <div key={dayIndex} className="mb-8 last:mb-0">
                    <h3 className="text-lg font-semibold mb-4 px-4">
                      Day {day.dayNumber} - {new Date(day.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </h3>
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-[200px]">Time</TableHead>
                            <TableHead className="w-[250px]">Event</TableHead>
                            <TableHead className="w-[250px]">Venue</TableHead>
                            <TableHead className="w-[120px]">Category</TableHead>
                            <TableHead className="min-w-[300px]">Coordinators</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {sortEventsByTime(day.events).map((event, eventIndex) => (
                            <TableRow key={eventIndex}>
                              <TableCell className="whitespace-nowrap">
                                <div className="flex items-center gap-1.5 text-sm">
                                  <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                                  {event.startTime} - {event.endTime}
                                </div>
                              </TableCell>
                              <TableCell className="font-medium">{event.name}</TableCell>
                              <TableCell>
                                <div className="flex items-center gap-1.5">
                                  <MapPin className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                                  <span className="line-clamp-2">{event.venue}</span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge variant="secondary" className="whitespace-nowrap">
                                  {event.category}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <div className="space-y-1">
                                  {event.coordinators.map((coordinator, idx) => (
                                    <div key={idx} className="flex items-center gap-2 flex-wrap">
                                      <span className="font-medium">{coordinator.name}</span>
                                      {coordinator.contact && (
                                        <span className="text-muted-foreground flex items-center gap-1.5">
                                          <Phone className="h-3.5 w-3.5" />
                                          {coordinator.contact}
                                        </span>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="technical">
            <Card>
              <CardHeader>
                <CardTitle>Technical Events</CardTitle>
                <CardDescription>Department-wise technical events</CardDescription>
              </CardHeader>
              <CardContent className="px-2 md:px-6">
                {technical.days.map((day, dayIndex) => (
                  <div key={dayIndex} className="mb-8 last:mb-0">
                    <h3 className="text-lg font-semibold mb-4 px-4">
                      Day {day.dayNumber} - {new Date(day.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </h3>
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-[200px]">Time</TableHead>
                            <TableHead className="w-[250px]">Event</TableHead>
                            <TableHead className="w-[250px]">Venue</TableHead>
                            <TableHead className="w-[120px]">Department</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {sortEventsByTime(day.events).map((event, eventIndex) => (
                            <TableRow key={eventIndex}>
                              <TableCell className="whitespace-nowrap">
                                <div className="flex items-center gap-1.5 text-sm">
                                  <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                                  {event.startTime}{event.endTime && ` - ${event.endTime}`}
                                </div>
                              </TableCell>
                              <TableCell className="font-medium">{event.name}</TableCell>
                              <TableCell>
                                <div className="flex items-center gap-1.5">
                                  <MapPin className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                                  <span className="line-clamp-2">{event.venue}</span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge variant="secondary" className="whitespace-nowrap">
                                  {event.department}
                                </Badge>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="cultural">
            <Card>
              <CardHeader>
                <CardTitle>Cultural Events</CardTitle>
                <CardDescription>Arts, music, dance and cultural activities</CardDescription>
              </CardHeader>
              <CardContent className="px-2 md:px-6">
                {cultural.days.map((day, dayIndex) => (
                  <div key={dayIndex} className="mb-8 last:mb-0">
                    <h3 className="text-lg font-semibold mb-4 px-4">
                      Day {day.dayNumber} - {new Date(day.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </h3>
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-[200px]">Time</TableHead>
                            <TableHead className="w-[250px]">Event</TableHead>
                            <TableHead className="w-[250px]">Venue</TableHead>
                            <TableHead className="w-[120px]">Category</TableHead>
                            <TableHead className="min-w-[300px]">Coordinators</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {sortEventsByTime(day.events).map((event, eventIndex) => (
                            <TableRow key={eventIndex}>
                              <TableCell className="whitespace-nowrap">
                                <div className="flex items-center gap-1.5 text-sm">
                                  <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                                  {event.startTime} - {event.endTime}
                                </div>
                              </TableCell>
                              <TableCell className="font-medium">{event.name}</TableCell>
                              <TableCell>
                                <div className="flex items-center gap-1.5">
                                  <MapPin className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                                  <span className="line-clamp-2">{event.venue}</span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge variant="secondary" className="whitespace-nowrap">
                                  {event.category}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <div className="space-y-1">
                                  {event.coordinators.map((coordinator, idx) => (
                                    <div key={idx} className="flex items-center gap-2 flex-wrap">
                                      <span className="font-medium">{coordinator.name}</span>
                                      {coordinator.contact && (
                                        <span className="text-muted-foreground flex items-center gap-1.5">
                                          <Phone className="h-3.5 w-3.5" />
                                          {coordinator.contact}
                                        </span>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}