-- Pump Master Database Schema
-- Copy this SQL and paste it into dbdiagram.io

Table Users {
  id int [pk, increment]
  username varchar [not null, unique]
  password_hash varbinary [not null]
  password_salt varbinary [not null]
  created_at timestamp [default: `now()`]
  updated_at timestamp [default: `now()`]
}

Table Pumps {
  id int [pk, increment]
  name varchar(100) [not null]
  type varchar(50) [not null]
  area varchar(100) [not null]
  latitude double [not null]
  longitude double [not null]
  flow_rate double [not null]
  offset double [not null]
  current_pressure double [not null]
  min_pressure double [not null]
  max_pressure double [not null]
  user_id int [not null, ref: > Users.id]
  created_at timestamp [default: `now()`]
  updated_at timestamp [default: `now()`]
}

Table PumpInspections {
  id int [pk, increment]
  inspection_date timestamp [not null]
  notes text
  pressure_reading double [not null]
  flow_rate_reading double [not null]
  is_operational boolean [not null]
  pump_id int [not null, ref: > Pumps.id]
  inspector_id int [not null, ref: > Users.id]
  created_at timestamp [default: `now()`]
  updated_at timestamp [default: `now()`]
}

-- Indexes for better performance
Indexes {
  (Pumps.user_id)
  (PumpInspections.pump_id)
  (PumpInspections.inspector_id)
  (PumpInspections.inspection_date)
  (Users.username)
} 