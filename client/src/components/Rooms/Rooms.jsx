import React, { useEffect, useState } from "react";
import MyContainer from "../MyContainer";
import Card from "./Card";
import Loader from "../Shared/Loader";
import { useSearchParams } from "react-router-dom";
import Heading from "../Heading/Heading";
import { getAllRooms } from "../../api/rooms";

const Rooms = () => {
  const [params, setParams] = useSearchParams();
  const category = params.get("category");
  console.log('category:', category);

  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getAllRooms()
      .then((data) => {
        if (category) {
          const filtered = data.filter((room) => room.category === category);
          setRooms(filtered);
        } else {
          setRooms(data);
        }
        setLoading(false);
      })
      .catch((error) => console.log(error.message));
  }, [category]);

  if (loading) {
    return <Loader></Loader>;
  }

  return (
    <MyContainer>
      {rooms && rooms.length > 0 ? (
        <div className="pt-12 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
          {rooms.map((room, index) => (
            <Card key={index} room={room}></Card>
          ))}
        </div>
      ) : (
        <div className="min-h-[calc(100vh-300px)] flex items-center justify-center">
          <Heading
            title="No Rooms Available in This Category!"
            subtitle="Please select other category.."
            center={true}
          ></Heading>
        </div>
      )}
    </MyContainer>
  );
};

export default Rooms;
