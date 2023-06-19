import React from "react";
import MyContainer from "../../components/MyContainer";
import Header from "../../components/Rooms/Header";
import RoomInfo from "../../components/Rooms/RoomInfo";
import RoomReservation from "../../components/Rooms/RoomReservation";
import { useLoaderData } from "react-router-dom";

const RoomDetails = () => {
  const data = useLoaderData();
  console.log(data);

  return (
    <MyContainer>
      <div className="max-w-screen-lg mx-auto">
        <div className="flex flex-col gap-6">
          <Header roomData={data}></Header>
          <div className="grid grid-cols-1 md:grid-cols-7 md:gap-10 mt-6">
            <RoomInfo roomData={data}></RoomInfo>
            <div className="md:col-span-3 mb-10 order-first md:order-last">
              <RoomReservation roomData={data}></RoomReservation>
            </div>
          </div>
        </div>
      </div>
    </MyContainer>
  );
};

export default RoomDetails;
