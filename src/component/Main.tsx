import { useEffect, useState } from "react";
import { useNavigate, useMatch, useLocation } from "react-router-dom";

/*TODO ::
   1. type any 확인하고 수정
   2. url 에 "/about/{id}" 값으로 붙어서 들어왔을 경우 모달 팝업 오픈된 상태여야함
   3. 페이지네이션 작업
   */

export default function Main() {
    interface Pokemons {
        id: number;
        name: string;
        types: {
            korean: string[];
            english: string[];
        };
        spritesFront: string;
    }
    interface AbilityData {
        name: string;
        flavorText: string;
    }
    interface EvolvesData {
        name: string;
        spritesFront: string;
    }
    interface ThisPokemon {
        id: number;
        name: string;
        types: {
            korean: string[];
            english: string[];
        };
        genera: string; //종 객체
        spritesFront: string;
        abilities: AbilityData[]; //특성
        description: string; //설명
        evolves: EvolvesData[]; //진화
        weight: number;
        height: number;
    }
    const [pokemons, setPokemons] = useState<Pokemons[]>([]);
    const [thisPokemon, setThisPokemons] = useState<ThisPokemon | undefined>(undefined);

    //click 시 open 되는 모달 팝업 관련 변수
    const navigate = useNavigate();
    const location = useLocation();
    const match = useMatch("/about/:id");

    const newPoke = async (id: number) => {
        let detailPokemon: ThisPokemon | undefined = undefined;
        try {
            const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
            const speciesResponse = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${id}`);

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
            for (let index = 0; index < data.types.length; index++) {
                const typeResponse = await fetch(data.types[index].type.url);
                const type = await typeResponse.json();
                const koreanTypeNameEntry = type.names.find(
                    (name: TypeNameLanguage) => name.language.name === "ko",
                ).name;
                const koreanTypeName: string = koreanTypeNameEntry //해당 변수 내부에(한국어 명칭이 기입되어 있을 경우)
                    ? koreanTypeNameEntry //한국어 출력
                    : data.types[index].type.name; //없으면 영어 출력

                typeKoreanArray.push(koreanTypeName);
                typeEnglishArray.push(data.types[index].type.name);
            }

            //종 객체
            interface Genera {
                language: {
                    [key: string]: string;
                };
                genus: string;
            }
            //한국어
            const koreanGeneraNameEntry: string = speciesData.genera.find(
                (name: Genera) => name.language.name === "ko",
            ).genus;
            //영어
            const englishGeneraNameEntry: string = speciesData.genera.find(
                (name: Genera) => name.language.name === "en",
            ).genus;
            const koreanGeneraName: string = koreanGeneraNameEntry //해당 변수 내부에(한국어 명칭이 기입되어 있을 경우)
                ? koreanGeneraNameEntry //한국어 출력
                : englishGeneraNameEntry; //없으면 영어 출력

            //특성
            interface Ability {
                language: {
                    [key: string]: string;
                };
                version_group: {
                    [key: string]: string;
                };
                flavor_text: string;
            }
            const abilitiesArray: AbilityData[] = [];
            for (let index = 0; index < data.abilities.length; index++) {
                const abilitiesResponse = await fetch(data.abilities[index].ability.url);
                const abilities = await abilitiesResponse.json();

                //이름
                const koreanAbilityNameEntry = abilities.names.find(
                    (name: Ability) => name.language.name === "ko",
                ).name;
                //한국어 없을 경우
                const koreanAbilityName = koreanAbilityNameEntry //해당 변수 내부에(한국어 명칭이 기입되어 있을 경우)
                    ? koreanAbilityNameEntry //한국어 출력
                    : data.abilities[index].ability.name; //없으면 영어 출력

                //텍스트 한국어
                const koreanAbilityEntry = abilities.flavor_text_entries.find(
                    (ability: Ability) =>
                        ability.language.name === "ko" && ability.version_group.name === "x-y",
                ).flavor_text;

                //텍스트 영어
                const englishAbilityEntry = abilities.flavor_text_entries.find(
                    (ability: Ability) =>
                        ability.language.name === "en" && ability.version_group.name === "x-y",
                ).flavor_text;

                const koreanAbility = koreanAbilityEntry //해당 변수 내부에(한국어 명칭이 기입되어 있을 경우)
                    ? koreanAbilityEntry //한국어 출력
                    : englishAbilityEntry; //없으면 영어 출력

                const abilityData: AbilityData = {
                    name: koreanAbilityName,
                    flavorText: koreanAbility,
                };
                abilitiesArray.push(abilityData);
            }

            //설명
            interface Description {
                language: {
                    [key: string]: string;
                };
                version: {
                    [key: string]: string;
                };
                flavor_text: string;
            }
            //텍스트 한국어
            const koreanDescriptionEntry: string = speciesData.flavor_text_entries.find(
                (ability: Description) =>
                    ability.language.name === "ko" && ability.version.name === "x",
            ).flavor_text;

            //텍스트 영어
            const englishDescriptionEntry: string = speciesData.flavor_text_entries.find(
                (ability: Description) =>
                    ability.language.name === "en" && ability.version.name === "x",
            ).flavor_text;

            const koreanDescription: string = koreanDescriptionEntry //해당 변수 내부에(한국어 명칭이 기입되어 있을 경우)
                ? koreanDescriptionEntry //한국어 출력
                : englishDescriptionEntry; //없으면 영어 출력

            //진화
            const allChainResponse = await fetch(speciesData.evolution_chain.url);
            const allChain = await allChainResponse.json();

            const chainInfo = async (id: string) => {
                const firstNameResponse = await fetch(
                    `https://pokeapi.co/api/v2/pokemon-species${id}`,
                );
                const firstSpritesResponse = await fetch(`https://pokeapi.co/api/v2/pokemon${id}`);
                const firstName = await firstNameResponse.json();
                const firstSprite = await firstSpritesResponse.json();

                //첫번째 chain 포켓몬 한국어 이름 찾기
                const firstKoreanNameEntry = firstName.names.find(
                    (names: KoreanNameEntry) => names.language.name === "ko",
                ).name;
                const firstKoreanName = firstKoreanNameEntry //해당 변수 내부에 name 이 있을 경우(한국어 명칭이 기입되어 있을 경우)
                    ? firstKoreanNameEntry //한국어 출력
                    : firstName.name; //없으면 영어 출력

                return {
                    name: firstKoreanName,
                    spritesFront: firstSprite.sprites.front_default,
                };
            };

            const evolvesData = [];
            let current = allChain.chain;
            while (current) {
                const id = current.species.url.replace(
                    "https://pokeapi.co/api/v2/pokemon-species",
                    "",
                );

                const info = await chainInfo(id);
                evolvesData.push(info);

                // 다음 진화 단계가 존재하는지 확인
                current = current.evolves_to?.[0];

                if (!current) break; // 더 이상 진화가 없으면 종료
            }

            detailPokemon = {
                id: data.id,
                name: koreanName,
                types: {
                    korean: typeKoreanArray,
                    english: typeEnglishArray,
                },
                genera: koreanGeneraName, //종 객체
                spritesFront: data.sprites.other.showdown.front_default,
                abilities: abilitiesArray,
                description: koreanDescription, //설명
                evolves: evolvesData, //진화
                weight: data.weight,
                height: data.height,
            };
        } catch (error) {
            console.error("Error:", error);
        }
        setThisPokemons(detailPokemon);
    };
    useEffect(() => {
        const poke = async () => {
            const newPokemons: Pokemons[] = [];
            //let index = 1; index < 152; index++ //1세대
            for (let index = 1; index < 30; index++) {
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

                    newPokemons.push({
                        id: data.id,
                        name: koreanName,
                        types: {
                            korean: typeKoreanArray,
                            english: typeEnglishArray,
                        },
                        spritesFront: data.sprites.front_default,
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
            <ul className="flex flex-wrap justify-center gap-[20px]">
                {/*<button onClick={() => openModal("123")}>Open Modal</button>*/}
                {pokemons.map((pokemon) => (
                    <li
                        key={pokemon.id}
                        className="w-[220px] mr-[4px] mb-[4px] border border-black shadow-[4px_4px_0_rgba(0,0,0,1)] rounded-lg bg-white transition duration-300 hover:translate-y-[-30px]"
                    >
                        <button
                            type="button"
                            className="w-[100%] h-[100%] block px-[15px] py-[20px] text-left cursor-pointer"
                            onClick={() => {
                                newPoke(pokemon.id);
                                navigate(`/about/${pokemon.id}`, {
                                    state: { backgroundLocation: location },
                                });
                            }}
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
                        </button>
                    </li>
                ))}
            </ul>
            {/* match되면 모달 렌더링 (실제 페이지 전환 아님) */}
            {match && thisPokemon !== undefined && (
                <div
                    onClick={() => {
                        setThisPokemons(undefined);
                        navigate(`/`);
                    }}
                    className="flex justify-center items-center fixed top-0 right-0 bottom-0 left-0 bg-[rgba(0,0,0,0.5)]"
                >
                    <div
                        onClick={(e) => e.stopPropagation()}
                        className="w-[440px] fixed top-1/2 left-1/2 px-[15px] py-[40px] box-border translate-x-[-50%] translate-y-[-50%] border border-black shadow-[4px_4px_0_rgba(0,0,0,1)] rounded-lg bg-white"
                    >
                        <button
                            className="w-[30px] h-[30px] absolute top-[15px] right-[15px] border border-transparent cursor-pointer rounded-[4px] transition duration-300 hover:shadow-lg hover:border-[#A6A6A6]"
                            onClick={() => {
                                setThisPokemons(undefined);
                                navigate(`/`);
                            }}
                        >
                            X
                        </button>
                        <div className="flex items-center">
                            <div className="w-[50%] h-[150px] relative">
                                <img
                                    src={thisPokemon.spritesFront}
                                    alt=""
                                    className="absolute top-1/2 left-1/2 translate-x-[-50%] translate-y-[-50%]"
                                />
                            </div>
                            <div>
                                <p className="block text-[#AEAEAE] text-[14px]">
                                    No.{String(thisPokemon.id).padStart(5, "0")}
                                </p>
                                <span className="block pt-[2px] text-[#AEAEAE] text-[16px]">
                                    {thisPokemon.genera}
                                </span>
                                <ul className="flex gap-[4px] pt-[4px] text-[15px]">
                                    {thisPokemon.types.korean.map(function (type, index) {
                                        return (
                                            <li
                                                key={index}
                                                className={`px-[12px] pt-[3px] pb-[2px] text-white rounded-[3px] type_${thisPokemon.types.english[index]}`}
                                            >
                                                {type}
                                            </li>
                                        );
                                    })}
                                </ul>
                                <h6 className="pt-[10px] text-[20px]">{thisPokemon.name}</h6>
                            </div>
                        </div>
                        <div>
                            <p className="pt-[10px] leading-5">{thisPokemon.description}</p>
                            <ul className="flex gap-[40px] pt-[20px] text-[15px]">
                                <li className="flex gap-[15px]">
                                    <div>
                                        <span className="type_info">키</span>
                                        <p className="pt-[10px] text-[16px] text-center">
                                            {thisPokemon.height / 10}M
                                        </p>
                                    </div>
                                    <div>
                                        <span className="type_info">체중</span>
                                        <p className="pt-[10px] text-[16px]  text-center">
                                            {thisPokemon.weight / 10}KG
                                        </p>
                                    </div>
                                </li>
                                <li>
                                    <span className="type_info">특성</span>
                                    <div className="pt-[10px]">
                                        {thisPokemon.abilities.map(function (ability, index) {
                                            return (
                                                <div
                                                    key={index}
                                                    className="flex items-start [&:nth-child(n+2)]:pt-[6px]"
                                                >
                                                    <h6 className="info_abilities">
                                                        {ability.name}
                                                    </h6>
                                                    <p className="pl-[10px] text-[16px] leading-5">
                                                        {ability.flavorText}
                                                    </p>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </li>
                            </ul>
                            <span className="type_info">진화</span>
                            <ul className="flex justify-center gap-[10px] pt-[20px]">
                                {thisPokemon.evolves.map(function (ability, index) {
                                    return (
                                        <li
                                            key={index}
                                            className="min-w-[120px] pb-[14px] border border-[#EBEBEB] rounded-[10px]"
                                        >
                                            <div className="w-[100%] h-[96px] relative">
                                                <img
                                                    src={ability.spritesFront}
                                                    alt=""
                                                    className="absolute left-1/2 translate-x-[-50%]"
                                                />
                                            </div>
                                            <p className="pt-[4px] text-center">{ability.name}</p>
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
