import { useEffect, useState } from "react";
/*import { Link } from 'react-router-dom';*/

export default function Main() {
    interface NewPokemon {
        id: number;
        name: string;
        types: {
            korean: string[];
            english: string[];
        };
        spritesFront: string;
    }
    const [pokemons, setPokemons] = useState<NewPokemon[]>([]);

    useEffect(() => {
        const poke = async () => {
            const newPokemons: NewPokemon[] = [];
            for (let index = 1; index < 152; index++) {
                try {
                    const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${index}`);
                    const speciesResponse = await fetch(
                        `https://pokeapi.co/api/v2/pokemon-species/${index}`,
                    );

                    const data = await response.json();
                    const speciesData = await speciesResponse.json();

                    interface KoreanNameEntry {
                        language: {
                            name: "ko";
                            url: string;
                        };
                        name: string;
                    }
                    const koreanNameEntry = speciesData.names.find(
                        //item 객체 내부 language.name 에 ko가 있을 경우 해당 객체 반환
                        (item: KoreanNameEntry) => item.language.name === "ko",
                    );

                    const koreanName = koreanNameEntry //해당 변수 내부에 name 이 있을 경우(한국어 명칭이 기입되어 있을 경우)
                        ? koreanNameEntry.name //한국어 출력
                        : data.name; //없으면 영어 출력

                    //타입 관련
                    interface TypeNameLanguage {
                        language: {
                            [key: string]: string;
                        };
                        name: string;
                    }
                    const typeKoreanArray: string[] = [];
                    const typeEnglishArray: string[] = [];
                    for (let subIndex = 0; subIndex < data.types.length; subIndex++) {
                        const typeResponse = await fetch(data.types[subIndex].type.url);
                        const type = await typeResponse.json();
                        const koreanTypeNameEntry = type.names.find(
                            (name: TypeNameLanguage) => name.language.name === "ko",
                        ).name;
                        const koreanTypeName = koreanTypeNameEntry //해당 변수 내부에(한국어 명칭이 기입되어 있을 경우)
                            ? koreanTypeNameEntry //한국어 출력
                            : data.types[subIndex].type.name; //없으면 영어 출력

                        typeKoreanArray.push(koreanTypeName);
                        typeEnglishArray.push(data.types[subIndex].type.name);
                    }
                    console.log(data);

                    newPokemons.push({
                        id: data.id,
                        name: koreanName,
                        types: {
                            korean: typeKoreanArray,
                            english: typeEnglishArray,
                        },
                        spritesFront: data.sprites.front_default,
                        //data.sprites.front_default -> png
                        //data.sprites.other.showdown.front_default -> gif
                    });
                } catch (error) {
                    console.error("Error:", error);
                }
            }
            setPokemons(newPokemons);
        };
        poke();
    }, []);

    return (
        <div style={{ width: "100%" }}>
            <ul className="flex flex-wrap gap-[10px]">
                {pokemons.map((pokemon) => (
                    <li
                        key={pokemon.id}
                        className="w-[190px] px-[15px] py-[20px] mr-[4px] mb-[4px] border border-black shadow-[4px_4px_0_rgba(0,0,0,1)] rounded-lg bg-white"
                    >
                        <div className="flex justify-center items-center">
                            <img src={pokemon.spritesFront} alt="" />
                        </div>
                        <div>
                            <span className="block text-[#AEAEAE] text-[14px]">
                                No.{String(pokemon.id).padStart(5, "0")}
                            </span>
                            <ul className="flex gap-[4px] pt-[4px] text-[15px]">
                                {pokemon.types.korean.map(function (type, index) {
                                    return (
                                        <li
                                            key={index}
                                            className={`px-[12px] pt-[3px] pb-[2px] text-white rounded-[3px] type_${pokemon.types.english[index]}`}
                                        >
                                            {type}
                                        </li>
                                    );
                                })}
                            </ul>
                            <p className="pt-[10px]">{pokemon.name}</p>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
}
