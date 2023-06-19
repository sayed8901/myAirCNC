import React from 'react';
import Heading from '../Heading/Heading';

const Header = ({roomData}) => {
    const {title, location, image} = roomData;

    return (
        <div>
            <Heading
            title={title}
            subtitle={location}
            center={false}
          ></Heading>
            <div className='w-full md:h-[70vh] overflow-hidden rounded-xl'>
                <img className='object-cover object-center w-full' src={image} alt="Header Image" />
            </div>
        </div>
    );
};

export default Header;