drop table if exists myTable;

create table myTable(
  id serial primary key,
  country varchar(255),
  confirmed varchar(10),
  deaths varchar(10),
  recovered varchar(10),
  date varchar(50)
);
