export interface Room {
  id: string;
  name: string;
}

export interface Booking {
  id: string;
  groupName: string;
  instructorName: string;
  day: string;
  timeFrom: string;
  timeTo: string;
  roomId: string;
  studentsCount: number;
  status: string; 
}
