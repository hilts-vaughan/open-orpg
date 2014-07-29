﻿using System;

/// <summary>
/// Defines a skill type
/// </summary>
public enum SkillType
{
    /// <summary>
    /// This is a standard damage dealing skill type
    /// </summary>
    Damage,
    Healing,
    Status,

    /// <summary>
    /// Summoning skills spawn other entities
    /// </summary>
    Summoning,

    /// <summary>
    /// Special skills have their logic executed via scripts. This is common for skills with special rules.
    /// </summary>
    Special

}


[Flags]
public enum SkillTargetType
{
    /// <summary>
    /// The player flags is any player, regardless of being an ally or not
    /// </summary>
    Players = 1,

    /// <summary>
    /// The ally flag is for any ally member
    /// </summary>
    Ally = 2,

    /// <summary>
    /// The enemy flag is for any enemy
    /// </summary>
    Enemy = 4,
}

public enum SkillActivationType
{
    Immediate,
    Target,
    Projectile
}

/// <summary>
/// This represents any possible states that a quest can potentially be in.
/// </summary>
public enum QuestState
{
    Available,
    InProgress,
    Finished

}

/// <summary>
/// An enumeration of equipment slots that are available for <see cref="Character"/>s.
/// These are flags as combining them is possible
/// </summary>
[Flags]
public enum EquipmentSlot
{
    Weapon,
    Head,
    Body,
    Back,
    Feet,
    Hands
}

public interface IQuestRequirementTable
{

    /// <summary>
    /// The quest Id that this entry represents a requirement for.
    /// </summary>
    long QuestTableId { get; set; }

}