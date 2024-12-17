import TypingAnimation from "@/components/ui/typing-animation";

export default function TypingAnimationDemo() {
    return (
        <div className="flex sm:h-screen h-[108vh] flex-col items-center w-[100vw] bg-gradient-to-br from-indigo-900 to-zinc-900 justify-center space-y-4">
            {/* Static Heading */}
            <h1 className="text-5xl -mt-60 font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 to-orange-400 via-red-300">
                About Us
            </h1>
            <hr/>
            {/* Typing Animation Component */}
            <TypingAnimation
                className="sm:text-2xl w-[95%] sm:w-[80%] text-lg font-bold italic text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-300 to-white"
                text="Ownio is an innovative web app that allows users to generate NFTs from articles, combining the world of digital art with written content. By transforming articles into unique, tradable digital assets, Ownio empowers creators and writers to explore new ways of monetizing their work and engaging with their audience. Whether you're a journalist, blogger, or content creator, Ownio provides a seamless platform to turn your articles into valuable NFTs, offering a creative and secure method for preserving and sharing your intellectual property. With Ownio, you can easily upload your articles, customize the appearance of your NFTs, and list them for sale on various NFT marketplaces. Our platform leverages blockchain technology to ensure the authenticity and ownership of each NFT, providing a transparent and trustworthy environment for both creators and buyers. Join the revolution and start turning your words into digital treasures with Ownio today"
            />
        </div>
    );
}


// 
