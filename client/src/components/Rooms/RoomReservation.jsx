import { useContext, useState } from "react";
import Calendar from "../Rooms/Calendar";
import Button from "../Button/Button";
import { AuthContext } from "../../providers/AuthProvider";
import { formatDistance } from "date-fns";
import BookingModal from "../Modal/BookingModal";
import { addBookings, updateStatus } from "../../api/bookings";
import toast from "react-hot-toast";
import { useNavigate } from 'react-router-dom';

const RoomReservation = ({ roomData }) => {
  const navigate = useNavigate();
  const { _id, image, host, title, location, price, from, to } = roomData;
  const { user, role } = useContext(AuthContext);
  const [isOpen, setIsOpen] = useState(false);
  const closeModal = () => {
    setIsOpen(false);
  };

  // price calculation
  const durationInfo = formatDistance(new Date(to), new Date(from));
  const duration = durationInfo.split(" ")[0];
  const actualDuration = parseFloat(duration);
  const totalPrice = actualDuration * price;
  // console.log(durationInfo, duration, totalPrice);

  const [datesValue, setDatesValue] = useState({
    startDate: new Date(from),
    endDate: new Date(to),
    key: "selection",
  });

  const handleDatesValue = (ranges) => {
    setDatesValue(ranges.selection);
  };

  // booking state
  const [bookingInfo, setBookingInfo] = useState({
    guest: {
      name: user.displayName,
      email: user.email,
      image: user.photoURL,
    },
    host: host.email,
    title,
    location,
    price: totalPrice,
    from: datesValue.startDate,
    to: datesValue.endDate,
    image,
    roomId: _id,
  });
  // console.log(bookingInfo);

  const modalHandler = () => {
    addBookings(bookingInfo)
      .then((data) => {
        console.log(data);
        updateStatus(roomData._id, true)
        .then((data) => {
          console.log(data)
          toast.success("Your Booking has been confirmed.");
          navigate('/dashboard/my-bookings')
          closeModal();
        });
      })
      .catch((error) => {
        console.log(error.message);
      });
    console.log(bookingInfo);
  };

  return (
    <div className="bg-white rounded-xl border-[1px] border-neutral-200 overflow-hidden">
      <div className="flex flex-row items-center gap-1 p-4">
        <div className="text-2xl font-semibold">$ {price}</div>
        <div className="font-light text-neutral-600">night</div>
      </div>
      <hr />
      <div className="flex justify-center">
        <Calendar
          datesValue={datesValue}
          handleDatesValue={handleDatesValue}
        ></Calendar>
      </div>
      <hr />
      <div
        onClick={() => {
          setIsOpen(true);
        }}
        className="p-4"
      >
        <Button
          disabled={roomData.host.email === user.email || roomData.booked}
          label="Reserve"
        ></Button>
      </div>
      <hr />
      <div className="p-4 flex flex-row items-center justify-between font-semibold text-2xl">
        <div>Total</div>
        <div>$ {totalPrice}</div>
      </div>

      <BookingModal
        isOpen={isOpen}
        bookingInfo={bookingInfo}
        modalHandler={modalHandler}
        closeModal={closeModal}
      ></BookingModal>
    </div>
  );
};

export default RoomReservation;
