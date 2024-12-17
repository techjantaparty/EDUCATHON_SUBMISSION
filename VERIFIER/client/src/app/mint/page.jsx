"use client";
import { useContext, useState } from "react";
import { useRouter } from "next/navigation";
import { uploadFileToIPFS, uploadJSONToIPFS } from "../pinata";
import marketplace from "./../marketplace.json";
import { ethers } from "ethers";
import { WalletContext } from "@/context/wallet";
import toast from "react-hot-toast";

export default function SellNFT() {
    const [formParams, updateFormParams] = useState({
        name: "",
        description: "",
        price: "",
    });
    const [fileURL, setFileURL] = useState();
    const [message, updateMessage] = useState("");
    const [btn, setBtn] = useState(false);
    const [btnContent, setBtnContent] = useState("List NFT");
    const router = useRouter();
    const { isConnected, signer } = useContext(WalletContext);

    // Helper function to count words
    const countWords = (str) => {
        return str.trim().split(/\s+/).length;
    };

    async function onFileChange(e) {
        try {
            const file = e.target.files[0];
            const data = new FormData();
            data.set("file", file);
            setBtn(false);
            updateMessage("Uploading Image...");
            const response = await uploadFileToIPFS(data);
            if (response.success === true) {
                setBtn(true);
                updateMessage("");
                setFileURL(response.pinataURL);
            }
            toast.success("Image Uploaded Successfully");
        } catch (e) {
            console.log("Error during file upload...", e);
        }
    }

    async function uploadMetadataToIPFS() {
        const { name, description, price } = formParams;
        if (!name || !description || !price || !fileURL) {
            updateMessage("Please fill all the fields!");
            return -1;
        }

        const nftJSON = {
            name,
            description,
            price,
            image: fileURL,
        };

        try {
            const response = await uploadJSONToIPFS(nftJSON);
            if (response.success === true) {
                return response.pinataURL;
            }
        } catch (e) {
            console.log("Error uploading JSON metadata: ", e);
        }
    }

    async function listNFT(e) {
        try {
            setBtnContent("Processing...");
            const metadataURL = await uploadMetadataToIPFS();
            if (metadataURL === -1) return;

            updateMessage("Uploading NFT...");

            let contract = new ethers.Contract(
                marketplace.address,
                marketplace.abi,
                signer
            );
            const price = ethers.parseEther(formParams.price);

            let transaction = await contract.createToken(metadataURL, price);
            await transaction.wait();

            setBtnContent("List NFT");
            setBtn(false);
            updateMessage("");
            updateFormParams({ name: "", description: "", price: "" });
            toast.success("NFT Listed Successfully");
            router.push("/profile");
        } catch (e) {
            toast.error("Failed to list NFT");
            console.log("Error listing NFT: ", e);
        }
    }

    const handleDescriptionChange = (e) => {
        const description = e.target.value;
        const wordCount = countWords(description);

        // Check if word count is within the 20-25 range
        if (wordCount <= 25) {
            updateFormParams({
                ...formParams,
                description: description,
            });
            if (wordCount < 20) {
                updateMessage("Description must be at least 20 words.");
            } else {
                updateMessage("");
            }
        }
    };

    return (
        <div className="relative min-h-screen bg-gradient-to-bl from-slate-900 via-cyan-800 to-sky-900 text-white">
            {/* Background Blur */}
            <div className="absolute mt-30 opacity-50 backdrop-blur-md"></div>

            {/* Main Content */}
            <div className="relative z-10 flex justify-center pt-30 items-center h-full">
                {isConnected ? (
                    <div className="w-full max-w-2xl p-8 bg-gray-800 bg-opacity-80 rounded-lg shadow-lg backdrop-blur-md">
                        <h2 className="text-2xl font-bold text-center mb-6">Mint your NFT</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium">NFT Name</label>
                                <input
                                    type="text"
                                    className="w-full p-3 mt-2 bg-gray-700 text-white rounded-lg"
                                    value={formParams.name}
                                    onChange={(e) =>
                                        updateFormParams({ ...formParams, name: e.target.value })
                                    }
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium">NFT Description</label>
                                <textarea
                                    className="w-full resize-none p-3 mt-2 bg-gray-700 text-white rounded-lg"
                                    rows={4}
                                    value={formParams.description}
                                    onChange={handleDescriptionChange}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium">Price (in INR)</label>
                                <input
                                    type="number"
                                    className="w-full p-3 mt-2 bg-gray-700 text-white rounded-lg"
                                    value={formParams.price}
                                    onChange={(e) =>
                                        updateFormParams({ ...formParams, price: e.target.value })
                                    }
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium">Upload Image</label>
                                <input
                                    type="file"
                                    className="w-full p-3 mt-2 bg-gray-700 text-white rounded-lg"
                                    onChange={onFileChange}
                                />
                            </div>

                            {/* Message and Button */}
                            <div className="text-center text-sm mt-4 text-yellow-300">{message}</div>
                            <button
                                onClick={listNFT}
                                className={`w-full p-3 mt-4 text-white rounded-lg transition duration-300 ${btn
                                    ? "bg-blue-600 hover:bg-blue-700"
                                    : "bg-gray-600 cursor-not-allowed"
                                    }`}
                                disabled={!btn}
                            >
                                {btnContent === "Processing..." && (
                                    <span className="animate-spin inline-block mr-2 w-4 h-4 border-t-2 border-white border-solid rounded-full" />
                                )}
                                {btnContent}
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="text-center text-lg text-yellow-300">Connect Your Wallet to Continue...</div>
                )}
            </div>
        </div>
    );
}
