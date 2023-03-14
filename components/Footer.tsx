import { IconBrandGithub, IconBrandTwitter } from "@tabler/icons-react";
import { FC } from "react";

export const Footer: FC = () => {
  return (
    <div className="flex h-[50px] border-t border-gray-300 py-2 px-8 items-center sm:justify-between justify-center">
      <div className="hidden sm:flex"></div>

      <div className=" text-white hidden sm:flex italic text-sm">
        Creidts to
        <a
          className="hover:opacity-50 mx-1"
          href="https://twitter.com/mckaywrigley"
          target="_blank"
          rel="noreferrer"
        >
          <b>Mckay Wrigley</b>
        </a>
        ,based on the HubermanLab podcast transcript
        <a
          className=" text-white hover:opacity-50 ml-1"
          href="https://twitter.com/hubermanlab"
          target="_blank"
          rel="noreferrer"
        >
          Dr. Andrew Huberman
        </a>
        .
      </div>

      <div className=" text-white flex space-x-4">
        <a
          className="flex items-center hover:opacity-50"
          href="https://twitter.com/ashishsavani1"
          target="_blank"
          rel="noreferrer"
        >
          <IconBrandTwitter size={24} />
        </a>

        <a
          className=" text-white flex items-center hover:opacity-50"
          href="https://github.com/avsavani/HubermanGPT"
          target="_blank"
          rel="noreferrer"
        >
          <IconBrandGithub size={24} />
        </a>
      </div>
    </div>
  );
};
