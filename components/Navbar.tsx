import { IconExternalLink } from "@tabler/icons-react";
import { FC } from "react";

export const Navbar: FC = () => {
    return (
        <div className="flex h-[60px] border-b border-gray-100 py-2 px-4 sm:px-8 items-center justify-between bg-gray-900 text-gray-300">
            <div className="font-bold text-2xl flex items-center">
                <a
                    className="hover:opacity-70 transition ease-in-out duration-150"
                    href="https://askhuberman.app"
                >
                    Huberman GPT
                </a>
            </div>
            <div className="flex items-center space-x-4">
                <a
                    className="flex items-center hover:opacity-70 transition ease-in-out duration-150"
                    href="https://hubermanlab.com/"
                    target="_blank"
                    rel="noreferrer"
                >
                    <div className="hidden sm:block">HubermanLab.com</div>
                    <IconExternalLink
                        className="ml-1"
                        size={20}
                    />
                </a>
            </div>
        </div>
    );
};
