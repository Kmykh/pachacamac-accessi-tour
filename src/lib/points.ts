export type Point = {
  id: string;
  number: number;
  name: string;
  short: string;
  full: string;
  easy: string;
  /** position as percentages on the map svg viewport */
  x: number;
  y: number;
};

export const POINTS: Point[] = [
  {
    id: "1",
    number: 1,
    name: "Entrada Principal",
    short: "Punto de inicio del recorrido accesible.",
    full: "Bienvenido a Pachacámac, centro ceremonial de la costa peruana construido hace más de 1500 años. Este lugar fue sagrado para culturas Lima, Wari e Inca.",
    easy: "Bienvenido. Este lugar tiene 1500 años. Aquí vivieron los Lima, los Wari y los Incas.",
    x: 14,
    y: 78,
  },
  {
    id: "2",
    number: 2,
    name: "Templo del Sol",
    short: "Pirámide inca dedicada al dios Inti.",
    full: "El Templo del Sol fue construido por los Incas en el siglo XV. Desde aquí se realizaban ceremonias al dios Sol Inti.",
    easy: "Los Incas hicieron este templo. Aquí rezaban al Sol. El Sol se llama Inti.",
    x: 38,
    y: 58,
  },
  {
    id: "3",
    number: 3,
    name: "Templo Pintado",
    short: "Murales antiguos con dioses marinos.",
    full: "El Templo Pintado es uno de los más antiguos del sitio, con murales de colores que representaban dioses marinos y serpientes.",
    easy: "Este templo es muy antiguo. Tiene dibujos de colores. Hay peces y serpientes.",
    x: 58,
    y: 42,
  },
  {
    id: "4",
    number: 4,
    name: "Plaza de los Peregrinos",
    short: "Lugar de reunión y culto.",
    full: "Miles de peregrinos viajaban desde todo el Perú para rendir culto al dios Pachacámac, creador del mundo.",
    easy: "Mucha gente venía aquí. Venían de todo el Perú. Rezaban a Pachacámac.",
    x: 46,
    y: 30,
  },
  {
    id: "5",
    number: 5,
    name: "Acllahuasi",
    short: "Casa de las mujeres escogidas.",
    full: "El Acllahuasi era la casa de las mujeres escogidas, las Acllas, que servían al Inca y al Sol.",
    easy: "Aquí vivían mujeres especiales. Se llamaban Acllas. Trabajaban para el Inca.",
    x: 70,
    y: 20,
  },
  {
    id: "6",
    number: 6,
    name: "Mirador del Océano",
    short: "Vista al Pacífico desde el sitio.",
    full: "Desde aquí puedes percibir el viento del océano Pacífico. En días claros el sonido del mar llega hasta estas piedras de mil años de antigüedad.",
    easy: "Aquí sopla el viento del mar. El mar se llama Pacífico. A veces se escuchan las olas.",
    x: 86,
    y: 14,
  },
];

export const getPoint = (id: string) => POINTS.find((p) => p.id === id);
