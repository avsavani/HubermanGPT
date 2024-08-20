import { IconBrandGithub, IconBrandTwitter } from "@tabler/icons-react";
import Image from "next/image";
import { FC } from "react";

export const Footer: FC = () => {
  return (
      <div className="flex h-[50px] border-t border-gray-300 py-2 px-8 items-center sm:justify-between justify-center">
        <div className="hidden sm:flex"></div>

        <div className="hidden sm:flex italic text-sm">
          Created by
          <a
              className="hover:opacity-50 mx-1"
              href="https://twitter.com/ashishsavani1"
              target="_blank"
              rel="noreferrer"
          >
            <b>Ashish Savani</b>
          </a>
          , based on the HubermanLab podcast transcript.
          <a
              className="hover:opacity-50 ml-1"
              href="https://hubermanlab.com"
              target="_blank"
              rel="noreferrer"
          >
            Not affiliated with Huberman Lab.
          </a>
          .
        </div>

        <div className="flex space-x-4">
          <a
              className="flex items-center hover:opacity-50"
              href="https://twitter.com/ashishsavani1"
              target="_blank"
              rel="noreferrer"
          >
            <IconBrandTwitter size={24} />
          </a>
          <a
              className="flex items-center hover:opacity-50"
              href="https://github.com/avsavani/HubermanGPT"
              target="_blank"
              rel="noreferrer"
          >
            <IconBrandGithub size={24} />
          </a>
          {/* Buy Me a Coffee Button */}
          <a
              className="flex items-center hover:opacity-50"
              href="https://www.buymeacoffee.com/avsavani"
              target="_blank"
              rel="noreferrer"
          >
            {/* Small square logo for mobile */}
            <div className="sm:hidden">
              <Image src="/bmc-logo.svg" width={18} height={20} alt="Buy Me a Coffee Logo" />
            </div>

            {/* 1/5th button size for larger screens */}
            <div className="hidden sm:block">
              <Image src="/bmc-button.svg" width={100} height={30} alt="Buy Me a Coffee Button" />
            </div>
          </a>
        </div>
      </div>
  );
};
