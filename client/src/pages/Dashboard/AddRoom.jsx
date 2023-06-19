import React, { useContext, useState } from "react";
import AddRoomForm from "../../components/Forms/AddRoomForm";
import { imageUpload } from "../../api/utility";
import { AuthContext } from "../../providers/AuthProvider";
import { addRoom } from "../../api/rooms";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const AddRoom = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const [dates, setDates] = useState({
    startDate: new Date(),
    endDate: new Date(),
    key: "selection",
  });

  const [loading, setLoading] = useState(false);
  const [uploadButtonText, setUploadButtonText] = useState("Upload Image");

  // handle form submit
  const handleSubmit = (event) => {
    setLoading(true);
    event.preventDefault();
    const location = event.target.location.value;
    const title = event.target.title.value;
    const from = dates.startDate;
    const to = dates.endDate;
    const price = event.target.price.value;
    const guests = event.target.total_guest.value;
    const bedrooms = event.target.bedrooms.value;
    const bathrooms = event.target.bathrooms.value;
    const description = event.target.description.value;
    const category = event.target.category.value;
    const image = event.target.image.files[0];
    setUploadButtonText('Uploading...')

    // upload image
    imageUpload(image)
      .then((imageData) => {
        // console.log(imageData.data);
        const imageURL = imageData.data.display_url;

        const roomData = {
          image: imageData.data.display_url,
          location,
          title,
          from,
          to,
          guests,
          bedrooms,
          bathrooms,
          description,
          category,
          price,
          host: {
            name: user?.displayName,
            image: user?.photoURL,
            email: user?.email,
          },
        };

        // post room data to server & DB
        addRoom(roomData)
        .then(data => {
          console.log(data);
          setUploadButtonText('Uploaded!');
          setLoading(false);
          toast.success('Room Added successfully!')
          navigate('/dashboard/my-listings')
        })
        .catch(error => {
          console.log(error.message);
        })

        // console.log(roomData);
        setLoading(false);
      })
      .catch((error) => {
        console.log(error.message);
        setLoading(false);
      });
  };

  const handleImageChange = (image) => {
    setUploadButtonText(image.name);
  };

  const handleDates = (ranges) => {
    // return console.log(ranges);
    setDates(ranges.selection);
  };

  return (
    <AddRoomForm
      handleSubmit={handleSubmit}
      loading={loading}
      handleImageChange={handleImageChange}
      uploadButtonText={uploadButtonText}
      dates={dates}
      handleDates={handleDates}
    ></AddRoomForm>
  );
};

export default AddRoom;
