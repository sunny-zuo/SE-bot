const Discord = require("discord.js");
const { request } = require("graphql-request");
const { uwflowQuery, uwflowEndpoint } = require("../util/uwflow-constants");

const courseMatcher = /([a-zA-Z]{2,}[ ]?\d+[a-zA-Z]?)/g;
const disallowedMatches = /(least)/gi;

module.exports = {
    name: "course",
    description: "Get information about a UWaterloo course",
    aliases: ["class"],
    args: true,
    guildOnly: false,
    displayHelp: true,
    usage: "(course)",
    async execute(client, message, args) {
        const courseName = args.toLowerCase().replace(/[^a-z0-9]/g, "");
        const variables = {
            code: courseName,
            user_id: 0,
        };
        const json = await request(uwflowEndpoint, uwflowQuery, variables);
        if (json.course.length < 1) {
            message.channel.send(
                new Discord.MessageEmbed()
                    .setColor("#9932cc")
                    .setTitle("Error: No Course Found")
                    .setDescription(
                        `No course with the name '${courseName}' was found.`
                    )
            );
            return;
        }

        const replacer = (course) => {
            if (disallowedMatches.test(course)) {
                return course;
            }
            return `**[${course}](https://uwflow.com/course/${course
                .toLowerCase()
                .replace(/\s/g, "")})**`;
        };

        const trimString = (str, max) => ((str && str.length > max) ? `${str.slice(0, max - 3).split(" ").slice(0, -1).join(" ")}...` : str);
        const course = json.course[0];
        const prereqs =
            trimString(course.prereqs?.replace(courseMatcher, replacer), 1024) ?? "None";
        const antireqs =
            trimString(course.antireqs?.replace(courseMatcher, replacer), 1024) ?? "None";

        const responseEmbed = new Discord.MessageEmbed()
            .setColor("#9932cc").setTitle(`${course.code.toUpperCase()}: ${course.name}`)
            .setDescription(
                `${course.description}\n **[View course on UWFlow](https://uwflow.com/course/${courseName})**`
            )
            .addFields(
                {
                    name: "Prerequisites",
                    value: prereqs,
                },
                {
                    name: "Antirequisites",
                    value: antireqs,
                },
                {
                    name: "Liked",
                    value: `${(course.rating.liked * 100).toFixed(2)}%`,
                    inline: true,
                },
                {
                    name: "Easy",
                    value: `${(course.rating.easy * 100).toFixed(2)}%`,
                    inline: true,
                },
                {
                    name: "Useful",
                    value: `${(course.rating.useful * 100).toFixed(2)}%`,
                    inline: true,
                }
            )
            .setFooter("https://github.com/sunny-zuo/sir-goose-bot");
        message.channel.send(responseEmbed);
    },
};
