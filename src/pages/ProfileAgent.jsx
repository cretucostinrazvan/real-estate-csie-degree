import React, { useEffect, useState } from 'react'
import { getAuth, updateProfile } from 'firebase/auth'
import { useNavigate } from 'react-router'
import { toast } from 'react-toastify'
import { updateDoc, doc, collection, query, where, orderBy, getDocs, getDoc, deleteDoc } from 'firebase/firestore'
import { db } from '../firebase'
import { FcHome } from 'react-icons/fc'
import { Link } from 'react-router-dom'
import ListingItem from '../components/ListingItem'

export default function ProfileAgent() {
    const auth = getAuth()
    const navigate = useNavigate()
    const [formData, setFormData] = useState({
        name: auth.currentUser.displayName,
        email: auth.currentUser.email
    })
    const { name, email } = formData
    function onLogout() {
        auth.signOut()
        navigate('/')
    }
    const [changeDetail, setChangeDetail] = useState(false)
    const [listings, setListings] = useState(null)
    const [loading, setLoading] = useState(true)
    function onChange(e) {
        setFormData((prevState) => ({
            ...prevState,
            [e.target.id]: e.target.value,
        }))
    }
    async function onSubmit() {
        try {
            if (auth.currentUser.displayName !== name) {
                //update the displayName in firebase auth
                await updateProfile(auth.currentUser, {
                    displayName: name,
                })
                //update the name in the firestore
                if (email.endsWith('@real-estate-csie-degree.com')) {
                    const docRef = doc(db, 'agents', auth.currentUser.uid)
                    await updateDoc(docRef, {
                        name: name,
                    })
                    toast.success('Profile agent name updated')
                }
            }
        } catch (error) {
            toast.error('Could not update the profile agent name')
        }
    }
    useEffect(() => {
        async function fetchUserListings() {
            const listingRef = collection(db, 'listings')
            const q = query(listingRef, where('userRef', '==', auth.currentUser.uid), orderBy('timestamp', 'desc'))
            const querySnap = await getDocs(q)
            let listings = []
            querySnap.forEach((doc) => {
                return listings.push({
                    id: doc.id,
                    data: doc.data(),
                })
            })
            setListings(listings)
            setLoading(false)
        }
        fetchUserListings()
    }, [auth.currentUser.uid])
    async function onDelete(listingID) {
        if (window.confirm('Are you sure you want to delete?')) {
            await deleteDoc(doc(db, 'listings', listingID))
            const updatedListings = listings.filter(
                (listing) => listing.id !== listingID
            )
            setListings(updatedListings)
            toast.success('Successfully deleted the listing')
        }
    }
    function onEdit(listingID) {
        navigate(`/edit-listing/${listingID}`)
    }
    const [agentCode, setAgentCode] = useState(null)
    const agentDocRef = doc(db, 'agents', auth.currentUser.uid)
    async function fetchAgentCode() {
        try {
            const agentDoc = await getDoc(agentDocRef)
            if (agentDoc.exists()) {
                const agentData = agentDoc.data()
                const agentCode = agentData.code
                setAgentCode(agentCode)
            }
        } catch (error) {
            console.log("Error fetching agent document:", error)
        }
    }
    fetchAgentCode()

    const [agents, setAgents] = useState([])
    useEffect(() => {
        const fetchAgents = async () => {
            const agentsRef = collection(db, 'agents');
            const q = query(agentsRef, where("emailAgent", "==", auth.currentUser.email)); // Add the "where" method to filter by agent ID
            const snapshot = await getDocs(q);
            const agentsData = snapshot.docs.map((doc) => {
                const data = doc.data();
                return {
                    id: doc.id,
                    answer1: data.answer1,
                    answer2: data.answer2,
                    answer3: data.answer3,
                    question1: data.question1,
                    question2: data.question2,
                    question3: data.question3,
                };
            });
            setAgents(agentsData);
        };
        fetchAgents()
    }, [])
    const updateAgent = async (agent) => {
        const agentsRef = collection(db, 'agents')
        const docRef = doc(agentsRef, agent.id)
        try {
            await updateDoc(docRef, {
                answer1: agent.answer1,
                answer2: agent.answer2,
                answer3: agent.answer3,
                question1: agent.question1,
                question2: agent.question2,
                question3: agent.question3,
            })
            toast.success('Answers updated succesfuly!')
        } catch (err) {
            toast.success('Could not update the answers!')
        }
    }
    return (
        <>
            <section className='max-w-6xl mx-auto flex justify-center items-center flex-col'>
                <h1 className='text-3xl text-center mt-6 font-bold'>My agent profile</h1>
                <div className='w-full md:w-[50%] mt-6 px-3'>
                    <form>
                        <input type="text" id='name' value={name} disabled={!changeDetail} onChange={onChange}
                            className={`mb-6 w-full px-4 py-2 text-xl text-gray-700 bg-white border border-gray-300 rounded transition ease-in-out 
            ${changeDetail && "bg-red-200 focus:bg-red-200"}`} />
                        <input type="email" id='email' value={email} disabled
                            className='mb-6 w-full px-4 py-2 text-xl text-gray-700 bg-white border border-gray-300 rounded transition ease-in-out' />
                        <div className='flex justify-between whitespace-nowrap text-sm sm:text-lg'>
                            <p className='flex items-center mb-6'>Do you want to change your name?
                                <span onClick={() => {
                                    changeDetail && onSubmit()
                                    setChangeDetail((prevState) => !prevState)
                                }} className='text-red-600 hover:text-red-700 transition ease-in-out duration-200 ml-1 cursor-pointer'>
                                    {changeDetail ? "Apply change" : "Edit"}</span>
                            </p>
                            <p onClick={onLogout} className='text-blue-600 hover:text-blue-800 transition duration-200 ease-in-out cursor-pointer'>Sign out</p>
                        </div>
                    </form>
                    {agents.map(agent => (
                        <div key={agent.id}>
                            <select id='question1' value={agent.question1} 
                                onChange={e => {
                                    const newAgents = [...agents]
                                    const index = newAgents.findIndex(a => a.id === agent.id)
                                    newAgents[index].question1 = e.target.value
                                    setAgents(newAgents)
                                }}>
                                <option value="What is your dog's name?">What is your dog's name?</option>
                                <option value="What is your cat's name?">What is your cat's name?</option>
                                <option value="What is your parrot's name?">What is your parrot's name?</option>
                            </select>
                            <input type="text" value={agent.answer1} className='mr-2 px-4 py-2 text-xl text-gray-700 bg-white border border-gray-300 rounded transition ease-in-out'
                                onChange={e => {
                                    const newAgents = [...agents]
                                    const index = newAgents.findIndex(a => a.id === agent.id)
                                    newAgents[index].answer1 = e.target.value
                                    setAgents(newAgents)
                                }}
                            />
                            <select id='question2' value={agent.question2} 
                                onChange={e => {
                                    const newAgents = [...agents]
                                    const index = newAgents.findIndex(a => a.id === agent.id)
                                    newAgents[index].question2 = e.target.value
                                    setAgents(newAgents)
                                }}>
                                <option value="Where do you live?">Where do you live?</option>
                                <option value="Where were you born?">Where were you born?</option>
                                <option value="What colour are your eyes?">What colour are your eyes?</option>
                            </select>
                            <input type="text" value={agent.answer2} className='mr-2 px-4 py-2 text-xl text-gray-700 bg-white border border-gray-300 rounded transition ease-in-out'
                                onChange={e => {
                                    const newAgents = [...agents]
                                    const index = newAgents.findIndex(a => a.id === agent.id)
                                    newAgents[index].answer2 = e.target.value
                                    setAgents(newAgents)
                                }}
                            />
                            <select id='question3' value={agent.question3}
                                onChange={e => {
                                    const newAgents = [...agents]
                                    const index = newAgents.findIndex(a => a.id === agent.id)
                                    newAgents[index].question3 = e.target.value
                                    setAgents(newAgents)
                                }}>
                                <option value="What is your favourite destination for vacation?">What is your favourite destination for vacation?</option>
                                <option value="What is your favourite color?">What is your favourite color?</option>
                                <option value="How much money do you have?">How much money do you have?</option>
                            </select>
                            <input type="text" value={agent.answer3} className='mr-2 px-4 py-2 text-xl text-gray-700 bg-white border border-gray-300 rounded transition ease-in-out'
                                onChange={e => {
                                    const newAgents = [...agents]
                                    const index = newAgents.findIndex(a => a.id === agent.id)
                                    newAgents[index].answer3 = e.target.value
                                    setAgents(newAgents)
                                }}
                            />
                            <button onClick={() => updateAgent(agent)}>Do you want to update your questions?</button>
                        </div>
                    ))}
                    <p id={`agentCode-${agentCode}`} className='text-sm text-gray-700'>
                        Your agent code: <strong>{agentCode}</strong>
                    </p>
                    <button type="submit" className='w-full bg-blue-600 text-white uppercase px-7 py-3 text-sm font-medium rounded shadow-md hover:bg-blue-700 transition duration-150 ease-in-out hover:shadow-lg active:bg-blue-800'>
                        <Link to='/create-listing' className='flex justify-center items-center'>
                            <FcHome className='mr-2 text-3xl bg-red-200 rounded-full p-1 border-2' />
                            Create property
                        </Link>
                    </button>
                </div>
            </section>
            <div className='max-w-6xl px-3 mt-6 mx-auto'>
                {!loading && listings.length > 0 && (
                    <>
                        <h2 className='text-2xl text-center font-semibold mb-6'>My listings</h2>
                        <ul className='sm:grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl-grid-cols-5 mt-6 mb-6'>
                            {listings.map((listing) => (
                                <ListingItem
                                    key={listing.id}
                                    id={listing.id}
                                    listing={listing.data}
                                    onDelete={() => onDelete(listing.id)}
                                    onEdit={() => onEdit(listing.id)} />
                            ))}
                        </ul>
                    </>
                )}
            </div>
        </>
    )
}