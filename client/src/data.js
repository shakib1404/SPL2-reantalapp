import { TbBeach, TbMountain, TbPool } from "react-icons/tb";
import {
  GiBarn,
  GiBoatFishing,
  GiCactus,
  GiCastle,
  GiCaveEntrance,
  GiForestCamp,
  GiIsland,
  GiWindmill,
} from "react-icons/gi";
import {
  FaSkiing,
  FaPumpSoap,
  FaShower,
  FaFireExtinguisher,
  FaUmbrellaBeach,
  FaKey,
} from "react-icons/fa";
import { FaHouseUser, FaPeopleRoof, FaKitchenSet } from "react-icons/fa6";
import {
  BiSolidWasher,
  BiSolidDryer,
  BiSolidFirstAid,
  BiWifi,
  BiSolidFridge,
  BiWorld,
} from "react-icons/bi";
import { BsSnow, BsFillDoorOpenFill, BsPersonWorkspace } from "react-icons/bs";
import { IoDiamond } from "react-icons/io5";
import { MdOutlineVilla, MdMicrowave, MdBalcony, MdYard, MdPets } from "react-icons/md";
import {
  PiBathtubFill,
  PiCoatHangerFill,
  PiTelevisionFill,
} from "react-icons/pi";
import { TbIroning3 } from "react-icons/tb";
import {
  GiHeatHaze,
  GiCctvCamera,
  GiBarbecue,
  GiToaster,
  GiCampfire,
} from "react-icons/gi";
import { AiFillCar } from "react-icons/ai";

export const categories = [
  {
    label: "All",
    icon: <BiWorld />,
  },
  {
    img: "assets/beach_cat.jpg",
    label: "Mohammadpur",
    icon: <MdOutlineVilla />, // You can choose a more fitting icon
    description: "A vibrant area known for its community parks and markets.",
  },
  {
    img: "assets/windmill_cat.webp",
    label: "Gulshan",
    icon: <IoDiamond />, // Luxury and upscale living
    description: "An upscale neighborhood with luxury shopping and dining.",
  },
  {
    img: "assets/modern_cat.webp",
    label: "Mirpur",
    icon: <TbMountain />, // Symbolizing hills or parks
    description: "A bustling area with a mix of residential and commercial spaces.",
  },
  {
    img: "assets/countryside_cat.webp",
    label: "Dhanmondi",
    icon: <GiIsland />, // Suggesting a calm atmosphere
    description: "Known for its lakes and cultural spots, perfect for relaxation.",
  },
  {
    img: "assets/pool_cat.jpg",
    label: "Bashundhara",
    icon: <TbPool />, // For residential areas with pools
    description: "A modern residential area with beautiful landscapes.",
  },
  {
    img: "assets/island_cat.webp",
    label: "Banani",
    icon: <GiWindmill />, // For its modern architecture
    description: "A posh area featuring parks and premium living spaces.",
  },
  {
    img: "assets/lake_cat.webp",
    label: "Lalmatia",
    icon: <GiBoatFishing />, // Suggesting proximity to water
    description: "A serene neighborhood with tree-lined streets and parks.",
  },
  {
    img: "assets/skiing_cat.jpg",
    label: "Tejgaon",
    icon: <FaSkiing />, // Suggesting activity and commerce
    description: "An industrial hub with various business establishments.",
  },
  {
    img: "assets/castle_cat.webp",
    label: "Old Dhaka",
    icon: <GiCastle />, // Reflecting historical significance
    description: "Rich in history, known for its ancient architecture and culture.",
  },
  {
    img: "assets/cave_cat.jpg",
    label: "Uttara",
    icon: <GiCaveEntrance />, // Reflecting urban development
    description: "A growing area with modern infrastructure and amenities.",
  },
  {
    img: "assets/camping_cat.jpg",
    label: "Sadarghat",
    icon: <GiForestCamp />, // Suggesting river activities
    description: "A vibrant riverside area known for its ferry services.",
  },
  {
    img: "assets/arctic_cat.webp",
    label: "Puran Dhaka",
    icon: <BsSnow />, // Reflecting cultural heritage
    description: "Known for its traditional markets and local foods.",
  },
  {
    img: "assets/desert_cat.webp",
    label: "Jatrabari",
    icon: <GiCactus />, // Suggesting bustling activity
    description: "A busy area known for its transport links and commercial spaces.",
  },
  {
    img: "assets/barn_cat.jpg",
    label: "Badda",
    icon: <GiBarn />, // Suggesting urban lifestyle
    description: "A vibrant community with growing residential options.",
  },
  {
    img: "assets/lux_cat.jpg",
    label: "Bashabo",
    icon: <IoDiamond />, // Representing luxury
    description: "An upscale area with modern amenities and services.",
  },
];
export const types = [
  {
    name: "An entire place",
    description: "Guests have the whole place to themselves",
    icon: <FaHouseUser />,
  },
  {
    name: "APARTMENT",
    description:
      "Guests have their own room in a house, plus access to shared places",
    icon: <BsFillDoorOpenFill />,
  },
  {
    name: "A Shared APARTMENT",
    description:
      "Guests sleep in a room or common area that maybe shared with you or others",
    icon: <FaPeopleRoof />,
  },
];

export const facilities = [
  {
    name: "Bath tub",
    icon: <PiBathtubFill />,
  },
  {
    name: "Personal care products",
    icon: <FaPumpSoap />,
  },
  {
    name: "Outdoor shower",
    icon: <FaShower />,
  },
  {
    name: "Washer",
    icon: <BiSolidWasher />,
  },
  {
    name: "Dryer",
    icon: <BiSolidDryer />,
  },
  {
    name: "Hangers",
    icon: <PiCoatHangerFill />,
  },
  {
    name: "Iron",
    icon: <TbIroning3 />,
  },
  {
    name: "TV",
    icon: <PiTelevisionFill />,
  },
  {
    name: "Dedicated workspace",
    icon: <BsPersonWorkspace />
  },
  {
    name: "Air Conditioning",
    icon: <BsSnow />,
  },
  {
    name: "Heating",
    icon: <GiHeatHaze />,
  },
  {
    name: "Security cameras",
    icon: <GiCctvCamera />,
  },
  {
    name: "Fire extinguisher",
    icon: <FaFireExtinguisher />,
  },
  {
    name: "First Aid",
    icon: <BiSolidFirstAid />,
  },
  {
    name: "Wifi",
    icon: <BiWifi />,
  },
  {
    name: "Cooking set",
    icon: <FaKitchenSet />,
  },
  {
    name: "Refrigerator",
    icon: <BiSolidFridge />,
  },
  {
    name: "Microwave",
    icon: <MdMicrowave />,
  },
  {
    name: "Stove",
    icon: <GiToaster />,
  },
  {
    name: "Barbecue grill",
    icon: <GiBarbecue />,
  },
  {
    name: "Outdoor dining area",
    icon: <FaUmbrellaBeach />,
  },
  {
    name: "Private patio or Balcony",
    icon: <MdBalcony />,
  },
  {
    name: "Camp fire",
    icon: <GiCampfire />,
  },
  {
    name: "Garden",
    icon: <MdYard />,
  },
  {
    name: "Free parking",
    icon: <AiFillCar />,
  },
  {
    name: "Self check-in",
    icon: <FaKey />
  },
  {
    name: " Pet allowed",
    icon: <MdPets />
  }
];
