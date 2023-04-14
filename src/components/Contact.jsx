import React, { useEffect, useState } from 'react'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '../firebase'
import { toast } from 'react-toastify'

export default function Contact({ userRef, listing }) {
    const [landlord, setLandLord] = useState(null)
    const [message, setMessage] = useState('')
    useEffect(() => {
        async function getLandLord() {
            const docRef = doc(db, 'agents', userRef)
            const docSnap = await getDoc(docRef)
            if (docSnap.exists()) {
                setLandLord(docSnap.data())
            } else {
                toast.error('Could not get landlord data')
            }
        }
        getLandLord()
    }, [userRef])
    function onChange(e) {
        setMessage(e.target.value)
    }
    return (
        <>{landlord !== null && (
            <div className='flex flex-col w-full'>
                <p className=''>
                    Contact {landlord.nameAgent} for the {listing.title.toLowerCase()}
                </p>
                <div className='mt-3 mb-6'>
                    <textarea name="message" id="message" rows="2" value={message} onChange={onChange} className='w-full px-4 py-2 text-xl text-gray-700 bg-white border border-gray-300 rounded transition duration-150 ease-in-out focus:text-gray-700 focus:bg-white focus:border-slate-600'>

                    </textarea>
                </div>
                <a href={`mailto:${landlord.emailAgent}?Subject=${listing.name}&body=${message}`}>
                    <button className='px-7 py-3 bg-blue-600 text-white rounded text-sm uppercase shadow-md hover:bg-blue-700 hover:shadow-lg focus:bg-blue-700 hover:focus-lg active:bg-blue-800 active:focus-lg transition duration-150 ease-in-out w-full text-center mb-6' type='button'>
                        Send message
                    </button>
                </a>
            </div>
        )}</>
    )
}
