
import { useAnimatedStyle, withSpring, withTiming, withDelay } from 'react-native-reanimated';
import Animated from 'react-native-reanimated';
import { Pressable, StyleSheet } from 'react-native';

type FloatingActionCardProps = {
    isExpanded: any;
    index: number;
    title: string;
    icon: string;
    type: string;
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
const OFFSET = 60;
const SPRING_CONFIG = {
    duration: 1200,
    overshootClamping: true,
    dampingRatio: 0.8,
};

export function FloatingActionCard({ isExpanded, index, title, icon, type }: { isExpanded: any, index: number, title: string, icon: string, type: string }) {
    const animatedStyles = useAnimatedStyle(() => {
        // highlight-next-line
        const moveValue = isExpanded.value ? OFFSET * index : 0;
        const translateValue = withSpring(-moveValue, SPRING_CONFIG);
        //highlight-next-line
        const delay = index * 100;

        const scaleValue = isExpanded.value ? 1 : 0;

        return {
            transform: [
                { translateY: translateValue },
                {
                    scale: withDelay(delay, withTiming(scaleValue)),
                },
            ],
        };
    });

    return (
        <AnimatedPressable style={[animatedStyles, styles.shadow, styles.optionCard]}>
            <Animated.Text style={styles.optionText}>{title}</Animated.Text>
        </AnimatedPressable>
    );
};

const styles = StyleSheet.create({
    shadow: {
        shadowColor: '#171717',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 6,
        elevation: 5,
    },
    optionCard: {
        flexDirection: 'column',
        alignItems: 'center',
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        width: 130, // Fixed width for each card
        height: 150, // Fixed height for each card
        justifyContent: 'center',
        marginBottom: 200,
        position: 'absolute',
        // Shadow will be applied dynamically based on card position
    },
    optionText: {
        marginTop: 8, // Changed from marginLeft to marginTop
        fontSize: 16, // Smaller font size to fit in card
        fontWeight: '500',
        textAlign: 'center',
    },
});