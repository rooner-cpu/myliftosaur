import { JSX } from "react";
import { Image, View } from "react-native";
import { BundledImages_resolve } from "../utils/bundledImages";
import { IconDumbbell } from "./icons/iconDumbbell";
import { IconGraphs } from "./icons/iconGraphs";
import { IconNotebook } from "./icons/iconNotebook";
import { IconTimerSmall } from "./icons/iconTimerSmall";
import { IconTracker } from "./icons/iconTracker";
import { Text } from "./primitives/text";
import { VmrAccountPanel } from "./vmrAccountPanel";

export function VmrAuthScreen(): JSX.Element {
  return (
    <View className="items-center justify-center flex-1 min-h-screen px-4 py-10 bg-[#06101f]">
      <View className="absolute top-0 left-0 right-0 h-32 bg-[#0b4aa2]" />
      <View className="absolute bottom-0 left-0 right-0 h-20 bg-[#020711]" />

      <View
        className="w-full overflow-hidden border shadow-2xl rounded-lg border-[#1e3f72] bg-[#081526]"
        style={{ maxWidth: 1150 }}
      >
        <View className="flex-col lg:flex-row">
          <View className="flex-1 px-5 py-6 md:px-8 md:py-8 lg:px-9">
            <View className="flex-row items-center">
              <Image
                source={BundledImages_resolve("/images/vmr-lift-logo.webp")}
                className="w-12 h-12"
                resizeMode="contain"
              />
              <View className="ml-4">
                <Text className="text-xs font-bold uppercase text-[#8fc5ff]">Hypertrophy App</Text>
                <Text className="text-2xl font-bold text-white">VMR-Lift</Text>
              </View>
            </View>

            <Text className="max-w-2xl mt-5 text-3xl font-bold leading-tight text-white md:text-[38px]">
              Build muscle with planned progression, clear history, and training that stays organized.
            </Text>
            <Text className="max-w-xl mt-3 text-sm leading-6 text-[#c8d6e8]">
              Track workouts, manage programs, review performance trends, and keep every serious training block tied
              to your account.
            </Text>

            <View className="flex-row flex-wrap mt-5">
              <AuthFeature icon={<IconDumbbell width={24} height={16} color="#8fc5ff" />} title="Progressive Overload" />
              <AuthFeature icon={<IconTracker size={20} color="#8fc5ff" />} title="Workout History" />
              <AuthFeature icon={<IconGraphs size={20} color="#8fc5ff" />} title="Strength Trends" />
              <AuthFeature icon={<IconNotebook size={20} color="#8fc5ff" />} title="Custom Programs" />
            </View>

            <View className="hidden max-w-xl mt-6 border rounded-lg md:flex border-[#254f86] bg-[#0c1d33]">
              <View className="flex-row items-center justify-between px-4 py-3 border-b border-[#254f86]">
                <Text className="text-sm font-bold text-white">Today&apos;s Focus</Text>
                <View className="flex-row items-center">
                  <IconTimerSmall size={18} color="#8fc5ff" />
                  <Text className="ml-2 text-xs font-semibold text-[#8fc5ff]">Ready</Text>
                </View>
              </View>
              <View className="px-4 py-4">
                <WorkoutLine label="Upper Volume" value="Chest, Shoulders, Triceps" />
                <WorkoutLine label="Top Set" value="Bench Press 1 x 6-8" />
                <WorkoutLine label="Progression" value="Add reps before load" />
              </View>
            </View>
          </View>

          <View
            className="justify-center w-full px-5 py-6 border-t lg:border-t-0 lg:border-l md:px-7 border-[#1e3f72] bg-white"
            style={{ maxWidth: 438 }}
          >
            <View className="w-full">
              <Image
                source={BundledImages_resolve("/images/vmr-lift-logo.webp")}
                className="self-center w-20 h-20"
                resizeMode="contain"
              />
              <Text className="mt-2 text-2xl font-bold text-center text-[#07111f]">Welcome Back</Text>
              <Text className="mt-2 text-sm text-center text-[#536173]">
                Sign in or register to access your VMR-Lift workouts, programs, and training history.
              </Text>
              <VmrAccountPanel />
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}

function AuthFeature(props: { icon: JSX.Element; title: string }): JSX.Element {
  return (
    <View className="flex-row items-center mr-4 mb-3">
      <View className="items-center justify-center w-9 h-9 border rounded border-[#2f609b] bg-[#0c1d33]">
        {props.icon}
      </View>
      <Text className="ml-2 text-sm font-semibold text-white">{props.title}</Text>
    </View>
  );
}

function WorkoutLine(props: { label: string; value: string }): JSX.Element {
  return (
    <View className="flex-row items-center justify-between py-2">
      <Text className="text-sm text-[#9fb3cc]">{props.label}</Text>
      <Text className="ml-4 text-sm font-semibold text-white">{props.value}</Text>
    </View>
  );
}
