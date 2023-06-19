import { CardElement, useElements, useStripe } from "@stripe/react-stripe-js";
import "./CheckoutForm.css";
import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../providers/AuthProvider";
import useAxiosSecure from "../../hooks/useAxiosSecure";
import { updateStatus } from "../../api/bookings";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { ImSpinner9 } from "react-icons/im";

const CheckoutForm = ({ closeModal, bookingInfo }) => {
  const { user } = useContext(AuthContext);
  const [axiosSecure] = useAxiosSecure("");
  const stripe = useStripe();
  const elements = useElements();
  const [cardError, setCardError] = useState();
  const [clientSecret, setClientSecret] = useState("");
  const [processing, setProcessing] = useState(false);
  const navigate = useNavigate();

  // getting clientSecret & payment info
  useEffect(() => {
    if (bookingInfo?.price) {
      axiosSecure
        .post("/create-payment-intent", { price: bookingInfo?.price })
        .then((res) => {
          console.log(res.data);
          setClientSecret(res.data.clientSecret);
        });
    }
  }, [bookingInfo, axiosSecure]);

  const handleSubmit = async (event) => {
    // Block native form submission.
    event.preventDefault();

    if (!stripe || !elements) {
      // Stripe.js has not loaded yet. Make sure to disable
      // form submission until Stripe.js has loaded.
      return;
    }

    // Get a reference to a mounted CardElement. Elements knows how
    // to find your CardElement because there can only ever be one of
    // each type of element.
    const card = elements.getElement(CardElement);

    if (card == null) {
      return;
    }

    // Use your card Element with other Stripe.js APIs
    const { error, paymentMethod } = await stripe.createPaymentMethod({
      type: "card",
      card,
    });

    if (error) {
      console.log("error", error);
      setCardError(error.message);
    } else {
      console.log("PaymentMethod", paymentMethod);
    }

    //   confirm payment
    setProcessing(true);
    const { paymentIntent, error: confirmError } =
      await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: card,
          billing_details: {
            name: user?.displayName || "anonymous",
            email: user?.email || "unknown",
          },
        },
      });

    if (confirmError) {
      console.log("confirmError", confirmError);
      setCardError(confirmError.message);
    } else {
      console.log("paymentIntent", paymentIntent);

      if (paymentIntent.status === "succeeded") {
        // save payment info on DB
        const paymentInfo = {
          ...bookingInfo,
          transactionID: paymentIntent.id,
          date: new Date(),
        };

        axiosSecure.post("/bookings", paymentInfo).then((data) => {
          console.log(data.data);
          if (data.data.insertedId) {
            updateStatus(paymentInfo.roomId, true)
              .then((data) => {
                console.log(data);
                const text = `Booking Successful!, transaction ID: ${paymentIntent.id}`;
                toast.success(text);
                navigate("/dashboard/my-bookings");
                setProcessing(false);
                closeModal();
              })
              .catch((err) => {
                setProcessing;
                console.log(err.message);
              });
          }
        });
      }
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit}>
        <CardElement
          options={{
            style: {
              base: {
                fontSize: "16px",
                color: "#424770",
                "::placeholder": {
                  color: "#aab7c4",
                },
              },
              invalid: {
                color: "#9e2146",
              },
            },
          }}
        />

        {/* Pay btn */}
        <div className="flex mt-2 justify-around">
          <button
            type="button"
            disabled={!stripe || !clientSecret || processing}
            className="inline-flex justify-center rounded-md border border-transparent bg-red-100 px-4 py-2 text-sm font-medium text-red-900 hover:bg-red-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
            onClick={closeModal}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="inline-flex justify-center rounded-md border border-transparent bg-green-100 px-4 py-2 text-sm font-medium text-green-900 hover:bg-green-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2"
            //   onClick={modalHandler}
          >
            {processing ? <ImSpinner9 className="m-auto animate-spin" size={24} /> : `Pay ${bookingInfo.price}$`}
          </button>
        </div>
      </form>

      {cardError && <p className="text-red-600 mt-8">{cardError}</p>}
    </>
  );
};

export default CheckoutForm;
