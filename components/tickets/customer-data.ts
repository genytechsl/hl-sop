// customer-data.ts

export const customers = [
  {
    id: 1,
    nic: "901234567V",
    name: "Nimal Perera",
    email: "nimal@email.com",
    mobile: "0771234567",
    property: "One Galle Face",
  },
  {
    id: 2,
    nic: "881112223V",
    name: "Kasun Silva",
    email: "kasun@email.com",
    mobile: "0715558899",
    property: "Cinnamon Life",
  },
  {
    id: 3,
    nic: "921234999V",
    name: "Amali Fernando",
    email: "amali@email.com",
    mobile: "0761234567",
    property: "Head Office",
  },
  {
    id: 4,
    nic: "912323232V",
    name: "Gayashan",
    email: "gayashanlocal@gmail.com",
    mobile: "0761234567",
    property: "Head Office",
  },
  {
    id: 5,
    nic: "912323232V",
    name: "Amodh",
    email: "leoamodh306c2@gmail.com",
    mobile: "0761234567",
    property: "Rathnarama Housing Scheme",
  },
];

export type Customer = (typeof customers)[0];
