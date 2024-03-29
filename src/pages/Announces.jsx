import React, { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import { collection, getDocs, limit, orderBy, query, startAfter, where } from 'firebase/firestore'
import { db } from '../firebase'
import Spinner from '../components/Spinner'
import ListingItem from '../components/ListingItem'
import { AiOutlineSearch } from 'react-icons/ai'
import { BsFillBuildingFill } from 'react-icons/bs'

export default function Announces() {
  const [listings, setListings] = useState(null)
  const [loading, setLoading] = useState(true)
  const [lastFetchListing, setLastFetchListing] = useState(null)
  useEffect(() => {
    async function fetchListings() {
      try {
        const listingRef = collection(db, 'listings')
        const q = query(listingRef, where('offer', '==', false), orderBy('timestamp', 'desc'))
        const querySnap = await getDocs(q)
        const lastVisible = querySnap.docs[querySnap.docs.length - 1]
        setLastFetchListing(lastVisible)
        const listings = []
        querySnap.forEach((doc) => {
          return listings.push({
            id: doc.id,
            data: doc.data(),
          })
        })
        setListings(listings)
        setLoading(false)
      } catch (error) {
        toast.error('Nu s-a putut prelua anunțul')
      }
    }
    fetchListings()
  }, [])
  const [type, setType] = useState('rent')
  const [property, setProperty] = useState('apartment')
  const [address, setAddress] = useState('')
  async function onFetchMoreListings(type, property, address) {
    try {
      const listingRef = collection(db, 'listings');
      let q = query(
        listingRef,
        where('offer', '==', false),
        where('type', '==', type),
        where('property', '==', property),
        orderBy('timestamp', 'desc'),
        startAfter(lastFetchListing),
        limit(4)
      );
      if (address) {
        q = query(
          listingRef,
          where('offer', '==', false),
          where('type', '==', type),
          where('property', '==', property),
          where('address', '==', address),
          orderBy('timestamp', 'desc'),
          startAfter(lastFetchListing),
          limit(4)
        );
      }
      const querySnap = await getDocs(q);
      const lastVisible = querySnap.docs[querySnap.docs.length - 1];
      setLastFetchListing(lastVisible);
      const listings = [];
      querySnap.forEach((doc) => {
        return listings.push({
          id: doc.id,
          data: doc.data(),
        });
      });
      setListings((prevState) => [...prevState, ...listings]);
      setLoading(false);
    } catch (error) {
      toast.error('Nu s-a putut prelua anunțul');
    }
  }
  function handleTypeChange(event) {
    setType(event.target.value)
  }
  function handlePropertyChange(event) {
    setProperty(event.target.value)
  }
  function handleAddressChange(event) {
    setAddress(event.target.value)
  }
  function handleSearchClick() {
    setLoading(true);
    async function fetchListings() {
      try {
        const listingRef = collection(db, 'listings');
        let q = query(
          listingRef,
          where('offer', '==', false),
          where('type', '==', type),
          where('property', '==', property),
          orderBy('timestamp', 'desc'),
          limit(8)
        );
        if (address) {
          q = query(
            listingRef,
            where('offer', '==', false),
            where('type', '==', type),
            where('property', '==', property),
            where('address', '==', address),
            orderBy('timestamp', 'desc'),
            limit(8)
          );
        }
        const querySnap = await getDocs(q);
        const lastVisible = querySnap.docs[querySnap.docs.length - 1];
        setLastFetchListing(lastVisible);
        const listings = [];
        querySnap.forEach((doc) => {
          return listings.push({
            id: doc.id,
            data: doc.data(),
          });
        });
        setListings(listings);
        setLoading(false);
      } catch (error) {
        toast.error('Nu s-a putut prelua anunțul');
      }
    }
    fetchListings();
  }
  return (
    <div className='h-screen'>
        <div className=' mx-2 px-3 py-6'>
          <div className="flex flex-col md:flex-row">
          <div className="w-auto mt-9 mr-3 md:mb-0 bg-slate-500 rounded px-2 py-2 shadow-lg h-full" id="pentruMine">
              <div className=' bg-red-500 text-gray-100 rounded-lg flex items-center px-1 mt-1  my-4  after:border-t after:flex-1 after:border-gray-100'>
                <AiOutlineSearch className='px-0.5 text-4xl' />
              </div>
              <div className="flex items-center justify-center px-1 py-1 mt-6 text-gray-100">
                <label className='mr-3 text-4xl'>
                  <BsFillBuildingFill className='bg-red-500 rounded px-1' />
                </label>
                <label className="mr-3 text-md font-normal text-gray-100 ">
                  <input
                    type="radio"
                    name="type"
                    value="rent"
                    checked={type === "rent"}
                    onChange={handleTypeChange}
                    className="mr-1 transition ease-in-out text-red-500 focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                  Închiriere
                </label>
                <label className='text-md font-normal text-gray-100 '>
                  <input
                    type="radio"
                    name="type"
                    value="sale"
                    checked={type === "sale"}
                    onChange={handleTypeChange}
                    className="mr-1 transition ease-in-out text-red-500 focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                  Vânzare
                </label>
              </div>
              <select name="property" value={property} onChange={handlePropertyChange} className="bg-gray-100 text-md transition ease-in-out block w-full mt-6 px-4 py-2 rounded-md focus:outline-none focus:ring focus:ring-red-500 focus:border-red-500">
                <option value="apartment" className="bg-gray-100 text-md transition ease-in-out block w-full mt-6 px-4 py-2 rounded-md focus:outline-none focus:ring focus:ring-red-500 focus:border-red-500" >Apartament</option>
                <option value="house" className="bg-gray-100 text-md transition ease-in-out block w-full mt-6 px-4 py-2 rounded-md  focus:outline-none focus:ring focus:ring-red-500 focus:border-red-500">Casă</option>
                <option value="land" className="bg-gray-100 text-md transition ease-in-out block w-full mt-6 px-4 py-2 rounded-md focus:outline-none focus:ring focus:ring-red-500 focus:border-red-500">Teren</option>
              </select>
              <div className="flex justify-center mt-4">
                <button className="text-gray-100 bg-red-500 px-3 py-3 rounded-lg hover:bg-red-600 transition ease-in-out font-medium " onClick={handleSearchClick}>
                  Caută acum
                </button>
              </div>
            </div>
            <div className="flex-grow" id="pentruAnunturi">
          <div className="flex items-center ml-2.5 mt-9 before:border-t-4  before:flex-1 before:border-gray-300 after:border-t-4 after:flex-1 after:border-gray-300 " />
              {loading ? (
                <Spinner />
              ) : listings && listings.length > 0 ? (
                <>
                  <main>
                  <ul className="sm:grid sm:grid-cols-3 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
                      {listings.map((listing) => (
                        <ListingItem key={listing.id} id={listing.id} listing={listing.data} />
                      ))}
                    </ul>
                  </main>

                </>
              ) : (
                <p className='text-2xl font-normal ml-2 mt-2'>Nu există anunțuri momentan</p>
              )}
            </div>
          </div>
        </div>
      </div>
      )
}